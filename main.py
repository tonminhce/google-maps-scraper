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
import random
import time

@dataclass
class Business:

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
    business_list: list[Business] = field(default_factory=list)
    
    def save_to_mongodb(self, collection_name="businesses"):
        load_dotenv()
        mongodb_uri = os.getenv('MONGODB_URI')
        
        if not mongodb_uri:
            print("Error: MONGODB_URI not found in .env file")
            return
        
        try:
            client = MongoClient(mongodb_uri)
            db = client.get_database()
            collection = db[collection_name]
            
            businesses_data = []
            for business in self.business_list:
                business_dict = asdict(business)
                business_dict['created_at'] = datetime.now()
                businesses_data.append(business_dict)
            
            if businesses_data:
                result = collection.insert_many(businesses_data)
                print(f"Successfully inserted {len(result.inserted_ids)} documents to MongoDB")
            else:
                print("No data to insert")
            
            client.close()
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")

    def dataframe(self):
        return pd.json_normalize(
            (asdict(business) for business in self.business_list), sep="_"
        )

def extract_coordinates_from_url(url: str) -> tuple[float,float]:
    
    coordinates = url.split('/@')[-1].split('/')[0]
    return float(coordinates.split(',')[0]), float(coordinates.split(',')[1])

def extract_district(address: str) -> str:
    if not address:
        return "Unknown"
    
    named_patterns = [
        (r'Bình\s*Thạnh', 'Bình Thạnh'),
        (r'Tân\s*Bình', 'Tân Bình'),
        (r'Tân\s*Phú', 'Tân Phú'),
        (r'Phú\s*Nhuận', 'Phú Nhuận'),
        (r'Gò\s*Vấp', 'Gò Vấp'),
        (r'Bình\s*Tân', 'Bình Tân'),
        (r'Thủ\s*Đức', 'Thủ Đức'),
        (r'Huyện\s*Củ\s*Chi', 'Củ Chi'),
        (r'Huyện\s*Hóc\s*Môn', 'Hóc Môn'),
        (r'Bình\s*Chánh', 'Bình Chánh'),
        (r'Nhà\s*Bè', 'Nhà Bè'),
        (r'Cần\s*Giờ', 'Cần Giờ'),
    ]
    
    for pattern, district_name in named_patterns:
        if re.search(pattern, address, re.IGNORECASE):
            return district_name
    
    numbered_patterns = [
        r'Quận\s*(\d+)',
        r'Q\.?\s*(\d+)',
        r'Q(\d+)',
    ]
    
    for pattern in numbered_patterns:
        match = re.search(pattern, address, re.IGNORECASE)
        if match:
            district_number = match.group(1)
            return f"Quận {district_number}"
    
    return "Unknown"

def extract_food_type(search_query: str) -> str:
    food_type = search_query.replace("Việt Nam Hồ Chí Minh", "").strip()
    food_type = search_query.replace("Việt Nam", "").replace("Hồ Chí Minh", "").strip()
    return food_type if food_type else "Unknown"

def main():
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
        input_file_name = 'input.txt'
        input_file_path = os.path.join(os.getcwd(), input_file_name)
        if os.path.exists(input_file_path):
            with open(input_file_path, 'r', encoding='utf-8') as file:
                search_list = file.readlines()
                
        if len(search_list) == 0:
            print('Error occured: You must either pass the -s search argument, or add searches to input.txt')
            sys.exit()
        
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        page.goto("https://www.google.com/maps", timeout=60000)
        page.wait_for_timeout(5000)
        
        for search_for_index, search_for in enumerate(search_list):
            print(f"-----\n{search_for_index} - {search_for}".strip())
            
            if search_for_index > 0:
                print("Waiting between searches...")
                time.sleep(random.uniform(5, 10))

            page.locator('//input[@id="searchboxinput"]').fill(search_for)
            page.wait_for_timeout(3000)

            page.keyboard.press("Enter")
            page.wait_for_timeout(5000)

            page.hover('//a[contains(@href, "https://www.google.com/maps/place")]')

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

            for listing_index, listing in enumerate(listings):
                try:
                    time.sleep(random.uniform(1, 3))
                    
                    current_listing_link = page.locator(
                        '//a[contains(@href, "https://www.google.com/maps/place")]'
                    ).nth(listing_index)
                    
                    current_listing = current_listing_link.locator("xpath=..")
                    
                    name_attibute = 'aria-label'
                    
                    business = Business()
                    
                    try:
                        current_listing.scroll_into_view_if_needed(timeout=5000)
                    except:
                        pass
                    
                    name_value = current_listing_link.get_attribute(name_attibute, timeout=5000)
                    if name_value and len(name_value) >= 1:
                        business.name = name_value
                    else:
                        business.name = ""
                    
                    current_listing.wait_for(state="visible", timeout=10000)
                    current_listing.click(timeout=10000)
                    page.wait_for_timeout(5000)

                    address_xpath = '//button[@data-item-id="address"]//div[contains(@class, "fontBodyMedium")]'
                    website_xpath = '//a[@data-item-id="authority"]//div[contains(@class, "fontBodyMedium")]'
                    phone_number_xpath = '//button[contains(@data-item-id, "phone:tel:")]//div[contains(@class, "fontBodyMedium")]'
                    review_count_xpath = '//button[@jsaction="pane.reviewChart.moreReviews"]//span'
                    reviews_average_xpath = '//div[@jsaction="pane.reviewChart.moreReviews"]//div[@role="img"]'
                    
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
                    
                    business.district = extract_district(business.address)
                    
                    business.food_type = extract_food_type(search_for)

                    business_list.business_list.append(business)
                except Exception as e:
                    print(f'Error occured on listing {listing_index + 1}/{len(listings)}: {e}')
                    
                    if "Timeout" in str(e):
                        print(f"Skipping listing {listing_index + 1} - element not accessible")
                    
                    try:
                        if page.url != "https://www.google.com/maps":
                            page.go_back(timeout=5000)
                            page.wait_for_timeout(2000)
                    except:
                        pass
                    continue
            
            business_list.save_to_mongodb(collection_name="hcm_food_places")

        browser.close()


if __name__ == "__main__":
    main()