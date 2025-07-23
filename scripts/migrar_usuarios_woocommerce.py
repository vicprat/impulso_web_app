import mysql.connector
import json
from datetime import datetime

# Configuración de la base de datos WooCommerce (MySQL)
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'database': 'impulsog_store',
    'user': 'root',
    'password': 'root123',
}

OUTPUT_FILE = './usuarios_woocommerce.json'

# Query actualizado para extraer solo información de usuarios
QUERY = '''
SELECT 
    u.ID as wp_user_id,
    u.user_login,
    u.user_email,
    u.user_registered,
    u.user_status,
    u.display_name,
    
    -- Información básica del perfil
    MAX(CASE WHEN um.meta_key = 'first_name' THEN um.meta_value END) as first_name,
    MAX(CASE WHEN um.meta_key = 'last_name' THEN um.meta_value END) as last_name,
    MAX(CASE WHEN um.meta_key = 'nickname' THEN um.meta_value END) as nickname,
    MAX(CASE WHEN um.meta_key = 'description' THEN um.meta_value END) as description,
    
    -- Información de contacto básica
    MAX(CASE WHEN um.meta_key = 'billing_phone' THEN um.meta_value END) as phone,
    
    -- Roles y capacidades
    MAX(CASE WHEN um.meta_key = 'wp_capabilities' THEN um.meta_value END) as wp_capabilities,
    MAX(CASE WHEN um.meta_key = 'wp_user_level' THEN um.meta_value END) as wp_user_level,
    
    -- Información adicional de perfil
    MAX(CASE WHEN um.meta_key = 'locale' THEN um.meta_value END) as locale,
    
    -- Avatar/Profile image
    MAX(CASE WHEN um.meta_key = 'profile_image' THEN um.meta_value END) as profile_image,
    MAX(CASE WHEN um.meta_key = 'avatar' THEN um.meta_value END) as avatar,
    
    -- Campos personalizados para redes sociales/links
    MAX(CASE WHEN um.meta_key = 'website' THEN um.meta_value END) as website,
    MAX(CASE WHEN um.meta_key = 'instagram' THEN um.meta_value END) as instagram,
    MAX(CASE WHEN um.meta_key = 'facebook' THEN um.meta_value END) as facebook,
    MAX(CASE WHEN um.meta_key = 'twitter' THEN um.meta_value END) as twitter,
    MAX(CASE WHEN um.meta_key = 'linkedin' THEN um.meta_value END) as linkedin,
    MAX(CASE WHEN um.meta_key = 'youtube' THEN um.meta_value END) as youtube,
    MAX(CASE WHEN um.meta_key = 'occupation' THEN um.meta_value END) as occupation,
    MAX(CASE WHEN um.meta_key = 'bio' THEN um.meta_value END) as bio

FROM wp_users u
LEFT JOIN wp_usermeta um ON u.ID = um.user_id

WHERE u.user_status = 0  -- Solo usuarios activos

GROUP BY u.ID, u.user_login, u.user_email, u.user_registered, u.user_status, u.display_name

ORDER BY u.user_registered DESC;
'''

def convert_datetime(dt_str):
    """Convierte string de datetime a formato ISO"""
    if dt_str:
        return dt_str.isoformat() if isinstance(dt_str, datetime) else str(dt_str)
    return None

def parse_wp_capabilities(capabilities_str):
    """Extrae roles de las capacidades de WordPress"""
    if not capabilities_str:
        return ['customer']
    
    # Las capacidades de WP vienen como: a:1:{s:8:"customer";b:1;}
    # Simplificamos extrayendo solo los roles principales
    role_mapping = {
        'administrator': 'admin',
        'shop_manager': 'manager', 
        'customer': 'customer',
        'subscriber': 'customer',
        'editor': 'editor',
        'author': 'author'
    }
    
    roles = []
    for wp_role, new_role in role_mapping.items():
        if wp_role in capabilities_str.lower():
            roles.append(new_role)
    
    return roles if roles else ['customer']

def extract_links(user_data):
    """Extrae enlaces de redes sociales del usuario"""
    links = []
    order = 0
    
    social_platforms = {
        'website': user_data.get('website'),
        'instagram': user_data.get('instagram'), 
        'facebook': user_data.get('facebook'),
        'twitter': user_data.get('twitter'),
        'linkedin': user_data.get('linkedin'),
        'youtube': user_data.get('youtube')
    }
    
    for platform, url in social_platforms.items():
        if url and url.strip():
            links.append({
                'platform': platform,
                'url': url.strip(),
                'order': order,
                'isPrimary': order == 0  # El primero es primario
            })
            order += 1
    
    return links

def main():
    try:
        # Conexión a la base de datos
        print("Conectando a la base de datos...")
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Ejecutar query
        print("Ejecutando query...")
        cur.execute(QUERY)
        
        users = []
        total_rows = 0
        
        for row in cur.fetchall():
            total_rows += 1
            
            # Mapear los datos del usuario
            user_data = {
                # Datos básicos
                'wp_user_id': row[0],
                'user_login': row[1],
                'user_email': row[2],
                'user_registered': convert_datetime(row[3]),
                'user_status': row[4],
                'display_name': row[5],
                
                # Perfil
                'first_name': row[6],
                'last_name': row[7], 
                'nickname': row[8],
                'description': row[9],
                'phone': row[10],
                
                # Roles
                'wp_capabilities': row[11],
                'wp_user_level': row[12],
                
                # Adicional
                'locale': row[13],
                'profile_image': row[14],
                'avatar': row[15],
                
                # Redes sociales
                'website': row[16],
                'instagram': row[17],
                'facebook': row[18],
                'twitter': row[19],
                'linkedin': row[20],
                'youtube': row[21],
                'occupation': row[22],
                'bio': row[23]
            }
            
            # Procesar datos para el mapeo a Prisma
            processed_user = {
                # Datos originales de WooCommerce
                'original': user_data,
                
                # Mapeo para Prisma User
                'user': {
                    'shopifyCustomerId': None,  # Se llenará cuando hagan login con Shopify
                    'email': user_data['user_email'],
                    'firstName': user_data['first_name'] or user_data['display_name'].split(' ')[0] if user_data['display_name'] else None,
                    'lastName': user_data['last_name'] or (user_data['display_name'].split(' ')[-1] if user_data['display_name'] and ' ' in user_data['display_name'] else None),
                    'isActive': user_data['user_status'] == 0,
                    'createdAt': user_data['user_registered'],
                    'updatedAt': user_data['user_registered'], # No tenemos last_update
                    'lastLoginAt': None, # WooCommerce no guarda esto
                    'isPublic': False
                },
                
                # Mapeo para Prisma Profile
                'profile': {
                    'occupation': user_data['occupation'],
                    'description': user_data['description'],
                    'bio': user_data['bio'] or user_data['description'],
                    'avatarUrl': user_data['avatar'] or user_data['profile_image'],
                    'backgroundImageUrl': None
                },
                
                # Mapeo para Prisma Links
                'links': extract_links(user_data),
                
                # Roles procesados
                'roles': parse_wp_capabilities(user_data['wp_capabilities'])
            }
            
            users.append(processed_user)
        
        # Guardar en archivo JSON
        print(f"Guardando {len(users)} usuarios en {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Exportación completada:")
        print(f"   - Total de filas procesadas: {total_rows}")
        print(f"   - Usuarios exportados: {len(users)}")
        print(f"   - Archivo generado: {OUTPUT_FILE}")
        
        # Estadísticas
        with_profile_image = sum(1 for u in users if u['profile']['avatarUrl'])
        with_links = sum(1 for u in users if u['links'])
        admins = sum(1 for u in users if 'admin' in u['roles'])
        
        print(f"\n📊 Estadísticas:")
        print(f"   - Usuarios con imagen de perfil: {with_profile_image}")
        print(f"   - Usuarios con enlaces sociales: {with_links}")
        print(f"   - Administradores: {admins}")
        
    except Exception as e:
        print(f"❌ Error durante la exportación: {e}")
        raise
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
        print("Conexión cerrada.")

if __name__ == '__main__':
    main()