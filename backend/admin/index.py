'''
Business: Админ-панель для управления пользователями, играми, музыкой и партнерами
Args: event - dict с httpMethod, body (action, данные)
      context - object с request_id
Returns: HTTP response с результатом операции
'''

import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn, cursor_factory=RealDictCursor)

def log_admin_action(conn, admin_id: int, action_type: str, target_id: int = None, details: str = None):
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO admin_actions (admin_id, action_type, target_id, details) VALUES (%s, %s, %s, %s)",
        (admin_id, action_type, target_id, details)
    )
    conn.commit()
    cur.close()

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers_data = event.get('headers', {})
    admin_id = headers_data.get('x-user-id') or headers_data.get('X-User-Id')
    
    if not admin_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Unauthorized'})
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT is_admin FROM users WHERE id = %s", (admin_id,))
        admin_check = cur.fetchone()
        
        if not admin_check or not admin_check['is_admin']:
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied'})
            }
        
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action')
        
        if action == 'get_users':
            cur.execute("SELECT id, username, blood_points, is_admin, is_banned, created_at FROM users ORDER BY created_at DESC")
            users = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(u) for u in users], default=str)
            }
        
        elif action == 'ban_user':
            user_id = body_data.get('user_id')
            cur.execute("UPDATE users SET is_banned = TRUE WHERE id = %s", (user_id,))
            conn.commit()
            log_admin_action(conn, int(admin_id), 'ban_user', user_id)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'unban_user':
            user_id = body_data.get('user_id')
            cur.execute("UPDATE users SET is_banned = FALSE WHERE id = %s", (user_id,))
            conn.commit()
            log_admin_action(conn, int(admin_id), 'unban_user', user_id)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'set_admin':
            user_id = body_data.get('user_id')
            is_admin = body_data.get('is_admin', True)
            cur.execute("UPDATE users SET is_admin = %s WHERE id = %s", (is_admin, user_id))
            conn.commit()
            log_admin_action(conn, int(admin_id), 'set_admin', user_id, str(is_admin))
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'add_blood_points':
            user_id = body_data.get('user_id')
            points = body_data.get('points', 0)
            cur.execute("UPDATE users SET blood_points = blood_points + %s WHERE id = %s", (points, user_id))
            conn.commit()
            log_admin_action(conn, int(admin_id), 'add_blood_points', user_id, str(points))
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'add_music':
            title = body_data.get('title')
            game = body_data.get('game')
            url = body_data.get('url')
            duration = body_data.get('duration', 0)
            
            cur.execute(
                "INSERT INTO music_tracks (title, game, url, duration) VALUES (%s, %s, %s, %s) RETURNING id",
                (title, game, url, duration)
            )
            track_id = cur.fetchone()['id']
            conn.commit()
            log_admin_action(conn, int(admin_id), 'add_music', track_id, title)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': track_id})
            }
        
        elif action == 'remove_music':
            track_id = body_data.get('track_id')
            cur.execute("DELETE FROM music_tracks WHERE id = %s", (track_id,))
            conn.commit()
            log_admin_action(conn, int(admin_id), 'remove_music', track_id)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'get_music':
            cur.execute("SELECT * FROM music_tracks ORDER BY created_at DESC")
            tracks = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(t) for t in tracks], default=str)
            }
        
        elif action == 'add_partner':
            name = body_data.get('name')
            url = body_data.get('url')
            logo_url = body_data.get('logo_url')
            description = body_data.get('description')
            
            cur.execute(
                "INSERT INTO partners (name, url, logo_url, description) VALUES (%s, %s, %s, %s) RETURNING id",
                (name, url, logo_url, description)
            )
            partner_id = cur.fetchone()['id']
            conn.commit()
            log_admin_action(conn, int(admin_id), 'add_partner', partner_id, name)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'id': partner_id})
            }
        
        elif action == 'get_partners':
            cur.execute("SELECT * FROM partners ORDER BY created_at DESC")
            partners = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(p) for p in partners], default=str)
            }
        
        elif action == 'remove_partner':
            partner_id = body_data.get('partner_id')
            cur.execute("DELETE FROM partners WHERE id = %s", (partner_id,))
            conn.commit()
            log_admin_action(conn, int(admin_id), 'remove_partner', partner_id)
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        elif action == 'get_admin_logs':
            cur.execute(
                "SELECT al.*, u.username as admin_name FROM admin_actions al JOIN users u ON al.admin_id = u.id ORDER BY al.created_at DESC LIMIT 100"
            )
            logs = cur.fetchall()
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps([dict(l) for l in logs], default=str)
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'})
            }
    
    finally:
        cur.close()
        conn.close()
