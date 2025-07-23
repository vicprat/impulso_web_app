import psycopg2
import json
import os

# Configuración de la base de datos destino
DB_CONFIG = {
    'host': 'HOST_NUEVA_DB',
    'port': 5432,
    'database': 'DB_NUEVA',
    'user': 'USER_NUEVA',
    'password': 'PASSWORD_NUEVA',
}

DATA_DIR = 'data'  # Carpeta donde están los JSON
ARCHIVOS = [
    'bank_accounts.json',
    'clients.json',
    'providers.json',
    'employees.json',
    'financial_entries.json',
]

def insertar(tabla, datos, cur):
    if not datos:
        return
    columnas = ','.join(datos[0].keys())
    valores = ','.join(['%s'] * len(datos[0]))
    for row in datos:
        cur.execute(f"INSERT INTO {tabla} ({columnas}) VALUES ({valores}) ON CONFLICT DO NOTHING", list(row.values()))

def main():
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    for archivo in ARCHIVOS:
        ruta = os.path.join(DATA_DIR, archivo)
        if not os.path.exists(ruta):
            print(f"No se encontró {ruta}")
            continue
        with open(ruta, 'r', encoding='utf-8') as f:
            datos = json.load(f)
        tabla = archivo.replace('.json', '')
        insertar(tabla, datos, cur)
        print(f"Importados {len(datos)} registros en {tabla}")
    conn.commit()
    cur.close()
    conn.close()
    print("Importación finalizada.")

if __name__ == '__main__':
    main() 