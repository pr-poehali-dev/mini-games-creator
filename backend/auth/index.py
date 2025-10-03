'''
Business: Регистрация и авторизация пользователей с сохранением в БД
Args: event - dict с httpMethod, body (username, email, password)
      context - object с request_id
Returns: HTTP response с токеном или ошибкой
'''

import json
import os
import hashlib
import secrets
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if action == 'register':
            username = body_data.get('username')
            email = body_data.get('email')
            password = body_data.get('password')
            
            if not all([username, email, password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing required fields'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "INSERT INTO users (username, email, password_hash, blood_points) VALUES (%s, %s, %s, %s) RETURNING id, username, email, blood_points",
                (username, email, password_hash, 100)
            )
            user = cur.fetchone()
            conn.commit()
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': dict(user)
                })
            }
        
        elif action == 'login':
            username = body_data.get('username')
            password = body_data.get('password')
            
            if not all([username, password]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing username or password'})
                }
            
            password_hash = hash_password(password)
            
            cur.execute(
                "SELECT id, username, email, blood_points FROM users WHERE username = %s AND password_hash = %s",
                (username, password_hash)
            )
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid credentials'})
                }
            
            cur.execute(
                "UPDATE users SET last_login = %s WHERE id = %s",
                (datetime.now(), user['id'])
            )
            conn.commit()
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': dict(user)
                })
            }
        
        elif action == 'update_points':
            user_id = body_data.get('user_id')
            points_delta = body_data.get('points_delta', 0)
            
            cur.execute(
                "UPDATE users SET blood_points = blood_points + %s WHERE id = %s RETURNING blood_points",
                (points_delta, user_id)
            )
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'blood_points': result['blood_points']})
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'})
            }
    
    except psycopg2.IntegrityError as e:
        conn.rollback()
        return {
            'statusCode': 409,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Username or email already exists'})
        }
    
    finally:
        cur.close()
        conn.close()
