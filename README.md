pip install pip-tools
pip-compile --upgrade requirements.in


python -m venv venv
source venv/Scripts/activate

pip install -r requirements.txt

playwright install