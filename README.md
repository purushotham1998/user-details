# Simple Flask User Details App

This small project serves a single page where users can submit their details (name, age, sex, experience, phone). The backend is a minimal Flask app that accepts JSON submissions and returns the submitted data.

Quick start (Windows PowerShell):

```powershell
python -m venv venv
# activate the venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Then open http://127.0.0.1:5000 in your browser.

Filters
-------

You can view all submitted users at `http://127.0.0.1:5000/users`.
This page now includes client-side filters for Age, Sex, and Experience and a Sort selector (Age/Experience/Name ascending or descending). Use the controls and click "Apply" to filter the displayed list without reloading the page.
