"""This script serves as an example on how to use Python 
   & Playwright to scrape/extract data from Google Maps"""

from playwright.sync_api import sync_playwright
from dataclasses import dataclass, asdict, field
import pandas as pd
import argparse
import os
import sys
import re
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

@dataclass
class Business:
    """holds business data"""

    name: str = None
    address: str = None
    website: str = None
    phone_number: str = None
    reviews_count: int = None
    reviews_average: float = None
    latitude: float = None
    longitude: float = None
    district: str = None
    food_type: str = None


@dataclass
class BusinessList:
    """holds list of Business objects,
    and save to MongoDB
    """
    business_list: list[Business] = field(default_factory=list)
    
    def save_to_mongodb(self, collection_name="businesses"):
        """saves business list to MongoDB
        
        Args:
            collection_name (str): MongoDB collection name
        """
        # Load environment variables
        load_dotenv()
        mongodb_uri = os.getenv('MONGODB_URI')
        
        if not mongodb_uri:
            print("Error: MONGODB_URI not found in .env file")
            return
        
        try:
            # Connect to MongoDB
            client = MongoClient(mongodb_uri)
            db = client.get_database()  # Uses database from connection string
            collection = db[collection_name]
            
            # Convert business list to dict and add timestamp
            businesses_data = []
            for business in self.business_list:
                business_dict = asdict(business)
                business_dict['created_at'] = datetime.now()
                businesses_data.append(business_dict)
            
            # Insert into MongoDB
            if businesses_data:
                result = collection.insert_many(businesses_data)
                print(f"Successfully inserted {len(result.inserted_ids)} documents to MongoDB")
            else:
                print("No data to insert")
            
            client.close()
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")

    def dataframe(self):
        """transform business_list to pandas dataframe

        Returns: pandas dataframe
        """
        return pd.json_normalize(
            (asdict(business) for business in self.business_list), sep="_"
        )

    def save_to_excel(self, filename):
        """saves pandas dataframe to excel (xlsx) file

        Args:
            filename (str): filename
        """

        if not os.path.exists(self.save_at):
            os.makedirs(self.save_at)
        self.dataframe().to_excel(f"output/{filename}.xlsx", index=False)

    def save_to_csv(self, filename):
        """saves pandas dataframe to csv file

        Args:
            filename (str): filename
        """

        if not os.path.exists(self.save_at):
            os.makedirs(self.save_at)
        self.dataframe().to_csv(f"output/{filename}.csv", index=False)

def extract_coordinates_from_url(url: str) -> tuple[float,float]:
    """helper function to extract coordinates from url"""
    
    coordinates = url.split('/@')[-1].split('/')[0]
    # return latitude, longitude
    return float(coordinates.split(',')[0]), float(coordinates.split(',')[1])

def extract_district(address: str) -> str:
    """helper function to extract district from address
    
    Args:
        address (str): full address string
        
    Returns:
        str: district name or "Unknown"
    """
    if not address:
        return "Unknown"
    
    district_patterns = [
        r'Quận\s*(\d+)',
        r'Q\.?\s*(\d+)',
        r'Q(\d+)',
        r'(Quận\s*Bình\s*Thạnh)',
        r'(Quận\s*Tân\s*Bình)',
        r'(Quận\s*Tân\s*Phú)',
        r'(Quận\s*Phú\s*Nhuận)',
        r'(Quận\s*Gò\s*Vấp)',
        r'(Quận\s*Bình\s*Tân)',
        r'(Quận\s*Thủ\s*Đức)',
        r'(Thành\s*phố\s*Thủ\s*Đức)',
        r'(TP\.\s*Thủ\s*Đức)',
        r'(Huyện\s*Củ\s*Chi)',
        r'(Huyện\s*Hóc\s*Môn)',
        r'(Huyện\s*Bình\s*Chánh)',
        r'(Huyện\s*Nhà\s*Bè)',
        r'(Huyện\s*Cần\s*Giờ)',
    ]
    
    address_upper = address
    
    for pattern in district_patterns:
        match = re.search(pattern, address_upper, re.IGNORECASE)
        if match:
            if match.group(1).isdigit():
                return f"Quận {match.group(1)}"
            else:
                return match.group(1)
    
    return "Unknown"

def extract_food_type(search_query: str) -> str:
    """helper function to extract food type from search query
    
    Args:
        search_query (str): search query string
        
    Returns:
        str: food type
    """
    # Remove "Việt Nam Hồ Chí Minh" from search query
    food_type = search_query.replace("Việt Nam Hồ Chí Minh", "").strip()
    food_type = search_query.replace("Việt Nam", "").replace("Hồ Chí Minh", "").strip()
    return food_type if food_type else "Unknown"

def main():
    
    ########
    # input 
    ########
    
    # read search from arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("-s", "--search", type=str)
    parser.add_argument("-t", "--total", type=int)
    args = parser.parse_args()
    
    if args.search:
        search_list = [args.search]
        
    if args.total:
        total = args.total
    else:
        total = 1_000_000

    if not args.search:
        search_list = []
        # read search from input.txt file
        input_file_name = 'input.txt'
        # Get the absolute path of the file in the current working directory
        input_file_path = os.path.join(os.getcwd(), input_file_name)
        # Check if the file exists
        if os.path.exists(input_file_path):
        # Open the file in read mode
            with open(input_file_path, 'r', encoding='utf-8') as file:
            # Read all lines into a list
                search_list = file.readlines()
                
        if len(search_list) == 0:
            print('Error occured: You must either pass the -s search argument, or add searches to input.txt')
            sys.exit()
        
    ###########
    # scraping
    ###########
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("https://www.google.com/maps", timeout=60000)
        # wait is added for dev phase. can remove it in production
        page.wait_for_timeout(5000)
        
        for search_for_index, search_for in enumerate(search_list):
            print(f"-----\n{search_for_index} - {search_for}".strip())

            page.locator('//input[@id="searchboxinput"]').fill(search_for)
            page.wait_for_timeout(3000)

            page.keyboard.press("Enter")
            page.wait_for_timeout(5000)

            # scrolling
            page.hover('//a[contains(@href, "https://www.google.com/maps/place")]')

            # this variable is used to detect if the bot
            # scraped the same number of listings in the previous iteration
            previously_counted = 0
            while True:
                page.mouse.wheel(0, 10000)
                page.wait_for_timeout(3000)

                if (
                    page.locator(
                        '//a[contains(@href, "https://www.google.com/maps/place")]'
                    ).count()
                    >= total
                ):
                    listings = page.locator(
                        '//a[contains(@href, "https://www.google.com/maps/place")]'
                    ).all()[:total]
                    listings = [listing.locator("xpath=..") for listing in listings]
                    print(f"Total Scraped: {len(listings)}")
                    break
                else:
                    # logic to break from loop to not run infinitely
                    # in case arrived at all available listings
                    if (
                        page.locator(
                            '//a[contains(@href, "https://www.google.com/maps/place")]'
                        ).count()
                        == previously_counted
                    ):
                        listings = page.locator(
                            '//a[contains(@href, "https://www.google.com/maps/place")]'
                        ).all()
                        print(f"Arrived at all available\nTotal Scraped: {len(listings)}")
                        break
                    else:
                        previously_counted = page.locator(
                            '//a[contains(@href, "https://www.google.com/maps/place")]'
                        ).count()
                        print(
                            f"Currently Scraped: ",
                            page.locator(
                                '//a[contains(@href, "https://www.google.com/maps/place")]'
                            ).count(),
                        )

            business_list = BusinessList()

            # scraping
            for listing in listings:
                try:
                    listing.click()
                    page.wait_for_timeout(5000)

                    name_attibute = 'aria-label'
                    address_xpath = '//button[@data-item-id="address"]//div[contains(@class, "fontBodyMedium")]'
                    website_xpath = '//a[@data-item-id="authority"]//div[contains(@class, "fontBodyMedium")]'
                    phone_number_xpath = '//button[contains(@data-item-id, "phone:tel:")]//div[contains(@class, "fontBodyMedium")]'
                    review_count_xpath = '//button[@jsaction="pane.reviewChart.moreReviews"]//span'
                    reviews_average_xpath = '//div[@jsaction="pane.reviewChart.moreReviews"]//div[@role="img"]'
                    
                    
                    business = Business()
                   
                    if len(listing.get_attribute(name_attibute)) >= 1:
        
                        business.name = listing.get_attribute(name_attibute)
                    else:
                        business.name = ""
                    if page.locator(address_xpath).count() > 0:
                        business.address = page.locator(address_xpath).all()[0].inner_text()
                    else:
                        business.address = ""
                    if page.locator(website_xpath).count() > 0:
                        business.website = page.locator(website_xpath).all()[0].inner_text()
                    else:
                        business.website = ""
                    if page.locator(phone_number_xpath).count() > 0:
                        business.phone_number = page.locator(phone_number_xpath).all()[0].inner_text()
                    else:
                        business.phone_number = ""
                    if page.locator(review_count_xpath).count() > 0:
                        business.reviews_count = int(
                            page.locator(review_count_xpath).inner_text()
                            .split()[0]
                            .replace(',','')
                            .strip()
                        )
                    else:
                        business.reviews_count = ""
                        
                    if page.locator(reviews_average_xpath).count() > 0:
                        business.reviews_average = float(
                            page.locator(reviews_average_xpath).get_attribute(name_attibute)
                            .split()[0]
                            .replace(',','.')
                            .strip())
                    else:
                        business.reviews_average = ""
                    
                    
                    business.latitude, business.longitude = extract_coordinates_from_url(page.url)
                    
                    # Extract district from address
                    business.district = extract_district(business.address)
                    
                    # Extract food type from search query
                    business.food_type = extract_food_type(search_for)

                    business_list.business_list.append(business)
                except Exception as e:
                    print(f'Error occured: {e}')
            
            #########
            # output
            #########
            # Save to MongoDB instead of Excel/CSV
            business_list.save_to_mongodb(collection_name="hcm_food_places")

        browser.close()


if __name__ == "__main__":
    main()