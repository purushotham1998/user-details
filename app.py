from flask import Flask, render_template, request, jsonify, g
import sqlite3
import os

app = Flask(__name__, static_folder='static', template_folder='templates')

# SQLite DB path
DATABASE = os.path.join(app.root_path, 'users.db')


def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
        # Ensure table exists
        db.execute(
            '''CREATE TABLE IF NOT EXISTS users (
                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                   name TEXT NOT NULL,
                   age INTEGER,
                   sex TEXT,
                   experience REAL,
                   phone TEXT
               )'''
        )
        db.commit()
    return db


@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    name = (data.get('name') or '').strip()
    try:
        age = int(data.get('age')) if data.get('age') not in (None, '') else None
    except Exception:
        age = None
    sex = data.get('sex') or ''
    try:
        experience = float(data.get('experience')) if data.get('experience') not in (None, '') else None
    except Exception:
        experience = None
    phone = data.get('phone') or ''

    user = {
        'name': name,
        'age': age,
        'sex': sex,
        'experience': experience,
        'phone': phone
    }

    # Persist to SQLite
    db = get_db()
    cur = db.execute(
        'INSERT INTO users (name, age, sex, experience, phone) VALUES (?,?,?,?,?)',
        (name, age, sex, experience, phone)
    )
    db.commit()
    user_id = cur.lastrowid
    row = db.execute('SELECT id, name, age, sex, experience, phone FROM users WHERE id = ?', (user_id,)).fetchone()

    saved = {
        'id': row['id'],
        'name': row['name'],
        'age': row['age'],
        'sex': row['sex'],
        'experience': row['experience'],
        'phone': row['phone']
    }

    return jsonify({'status': 'ok', 'user': saved})


@app.route('/users')
def users_page():
    # Render an HTML page listing all submitted users (read from DB)
    db = get_db()
    rows = db.execute('SELECT id, name, age, sex, experience, phone FROM users ORDER BY id DESC').fetchall()
    users_list = [
        {
            'id': r['id'],
            'name': r['name'],
            'age': r['age'],
            'sex': r['sex'],
            'experience': r['experience'],
            'phone': r['phone']
        }
        for r in rows
    ]
    return render_template('users.html', users=users_list)


@app.route('/api/users')
def api_users():
    # Return JSON list of users (useful for programmatic access)
    db = get_db()
    rows = db.execute('SELECT id, name, age, sex, experience, phone FROM users ORDER BY id DESC').fetchall()
    users_list = [
        {
            'id': r['id'],
            'name': r['name'],
            'age': r['age'],
            'sex': r['sex'],
            'experience': r['experience'],
            'phone': r['phone']
        }
        for r in rows
    ]
    return jsonify({'users': users_list})

if __name__ == '__main__':
    # Use environment variables for host/port so the app can run without gunicorn
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() in ('1', 'true', 'yes')
    app.run(host=host, port=port, debug=debug)
