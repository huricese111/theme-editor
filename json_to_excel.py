import json
import pandas as pd
import os
from datetime import datetime

def convert_dealers_json_to_excel():
    # File paths
    json_file_path = 'e:/Hepha theme editor/assets/dealers-data.json'
    excel_file_path = 'e:/Hepha theme editor/assets/dealers-data.xlsx'
    
    try:
        # Read JSON file
        with open(json_file_path, 'r', encoding='utf-8') as jsonfile:
            data = json.load(jsonfile)
        
        # Extract dealers array
        dealers = data.get('dealers', [])
        
        if not dealers:
            print("No dealers data found in JSON file.")
            return
        
        # Convert to DataFrame
        rows = []
        
        for dealer in dealers:
            # Handle store_type array - convert to comma-separated string
            store_types = dealer.get('store_type', [])
            store_type_str = ', '.join(store_types) if store_types else ''
            
            # Create row data
            row = {
                'ID': dealer.get('id', ''),
                'Store Name': dealer.get('store_name', ''),
                'Address': dealer.get('address', ''),
                'City': dealer.get('city', ''),
                'Province/State': dealer.get('province_state', ''),
                'Country': dealer.get('country', ''),
                'Postal Code': dealer.get('postal_code', ''),
                'Phone': dealer.get('phone', ''),
                'Email': dealer.get('email', ''),
                'Website': dealer.get('website', ''),
                'Hours of Operation': dealer.get('hours_of_operation', ''),
                'Store Type': store_type_str,
                'Latitude': dealer.get('latitude', 0),
                'Longitude': dealer.get('longitude', 0)
            }
            
            rows.append(row)
        
        # Create DataFrame
        df = pd.DataFrame(rows)
        
        # Write to Excel with formatting
        with pd.ExcelWriter(excel_file_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name='Dealers', index=False)
            
            # Get the workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Dealers']
            
            # Auto-adjust column widths
            for column in worksheet.columns:
                max_length = 0
                column_letter = column[0].column_letter
                
                for cell in column:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                
                # Set column width (with some padding)
                adjusted_width = min(max_length + 2, 50)  # Max width of 50
                worksheet.column_dimensions[column_letter].width = adjusted_width
            
            # Add header formatting
            from openpyxl.styles import Font, PatternFill
            
            header_font = Font(bold=True)
            header_fill = PatternFill(start_color='CCCCCC', end_color='CCCCCC', fill_type='solid')
            
            for cell in worksheet[1]:
                cell.font = header_font
                cell.fill = header_fill
        
        # Get file sizes
        json_size = os.path.getsize(json_file_path)
        excel_size = os.path.getsize(excel_file_path)
        
        # Print statistics
        print(f"\n=== JSON to Excel Conversion Complete ===")
        print(f"Total dealers converted: {len(dealers)}")
        print(f"JSON file size: {json_size:,} bytes")
        print(f"Excel file size: {excel_size:,} bytes")
        
        # Count store types
        dealer_count = sum(1 for dealer in dealers if 'dealer' in dealer.get('store_type', []))
        rental_count = sum(1 for dealer in dealers if 'rental' in dealer.get('store_type', []))
        service_count = sum(1 for dealer in dealers if 'service' in dealer.get('store_type', []))
        
        print(f"\n=== Store Type Statistics ===")
        print(f"Dealers: {dealer_count}")
        print(f"Rental Stations: {rental_count}")
        print(f"Service Centers: {service_count}")
        
        # Show first 3 records as preview
        print(f"\n=== Preview (First 3 Records) ===")
        for i, dealer in enumerate(dealers[:3]):
            store_types = ', '.join(dealer.get('store_type', []))
            print(f"\nRecord {i+1}:")
            print(f"  ID: {dealer.get('id', '')}")
            print(f"  Store Name: {dealer.get('store_name', '')}")
            print(f"  Address: {dealer.get('address', '')}")
            print(f"  City: {dealer.get('city', '')}")
            print(f"  Store Type: {store_types}")
            print(f"  Coordinates: ({dealer.get('latitude', 0)}, {dealer.get('longitude', 0)})")
        
        print(f"\nExcel file saved as: {excel_file_path}")
        
    except FileNotFoundError:
        print(f"Error: Could not find the JSON file at {json_file_path}")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in {json_file_path}")
    except ImportError:
        print("Error: Required libraries not installed. Please install pandas and openpyxl:")
        print("pip install pandas openpyxl")
    except Exception as e:
        print(f"Error during conversion: {e}")

if __name__ == "__main__":
    convert_dealers_json_to_excel()