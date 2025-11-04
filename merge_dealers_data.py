import csv
import json
import os
import re


CSV_PATH = os.path.join("assets", "20251103_dealers-data_LCH.csv")
JSON_PATH = os.path.join("assets", "dealers-data.json")


def coerce_float(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip().strip('"').strip("'")
    if s == "":
        return None
    # Replace comma decimal with dot
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def sanitize_text(value):
    if value is None:
        return ""
    s = str(value)
    # Remove stray triple quotes or double quotes at the end
    s = s.strip()
    if s.endswith('""'):
        s = s[:-2]
    # Normalize Windows-style CRLF to LF in multi-line fields
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    return s


def is_empty(value):
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    if isinstance(value, list):
        return len(value) == 0
    return False


def parse_store_type(s):
    s = sanitize_text(s)
    if s == "":
        return []
    parts = re.split(r"[;,\|/]+", s)
    parts = [p.strip() for p in parts if p.strip()]
    # Ensure values like 'dealer'/'service' only
    normalized = []
    for p in parts:
        lp = p.lower()
        if lp in {"dealer", "service"}:
            normalized.append(lp)
        else:
            normalized.append(p)
    # Deduplicate preserving order
    seen = set()
    result = []
    for p in normalized:
        if p not in seen:
            seen.add(p)
            result.append(p)
    return result


def row_to_entry(row):
    entry = {
        "id": sanitize_text(row.get("ID")),
        "store_name": sanitize_text(row.get("Store Name")),
        "address": sanitize_text(row.get("Address")),
        "city": sanitize_text(row.get("City")),
        "province_state": "",  # CSV doesn't provide; keep empty for new entries
        "country": sanitize_text(row.get("Country")),
        "postal_code": sanitize_text(row.get("Postal Code")),
        "phone": sanitize_text(row.get("Phone")),
        "email": sanitize_text(row.get("Email")),
        "website": sanitize_text(row.get("Website")),
        "hours_of_operation": sanitize_text(row.get("Hours of Operation")),
        "store_type": parse_store_type(row.get("Store Type")),
        "latitude": coerce_float(row.get("Latitude")),
        "longitude": coerce_float(row.get("Longitude")),
    }
    return entry


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Basic shape check
    if not isinstance(data, dict) or "dealers" not in data or not isinstance(data["dealers"], list):
        raise ValueError("Invalid JSON structure: expected { 'dealers': [...] }")
    return data


def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")


def load_csv(path):
    with open(path, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        return list(reader)


def main():
    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"CSV not found: {CSV_PATH}")
    if not os.path.exists(JSON_PATH):
        raise FileNotFoundError(f"JSON not found: {JSON_PATH}")

    # Load data
    json_data = load_json(JSON_PATH)
    csv_rows = load_csv(CSV_PATH)

    dealers = json_data.get("dealers", [])
    dealers_by_id = {d.get("id"): d for d in dealers if d.get("id")}

    updated_fields = 0
    created_dealers = 0
    field_fill_counts = {}

    for row in csv_rows:
        entry = row_to_entry(row)
        dealer_id = entry.get("id")
        if not dealer_id:
            continue
        if dealer_id in dealers_by_id:
            # Merge: only fill missing/empty fields, do not overwrite non-empty
            target = dealers_by_id[dealer_id]
            for key, value in entry.items():
                if key in {"id"}:
                    continue
                if key not in target or is_empty(target.get(key)):
                    # For numeric fields, check None specifically
                    if key in {"latitude", "longitude"}:
                        if value is None:
                            continue
                    # For store_type, ensure list
                    if key == "store_type":
                        if not value:
                            continue
                    target[key] = value
                    updated_fields += 1
                    field_fill_counts[key] = field_fill_counts.get(key, 0) + 1
        else:
            # Add new dealer from CSV
            dealers.append(entry)
            dealers_by_id[dealer_id] = entry
            created_dealers += 1

    json_data["dealers"] = dealers

    # Save
    save_json(JSON_PATH, json_data)

    # Print summary
    print("Merge complete.")
    print(f"Filled fields: {updated_fields}")
    print(f"New dealers added: {created_dealers}")
    print("Field fill breakdown:")
    for k in sorted(field_fill_counts.keys()):
        print(f"  {k}: {field_fill_counts[k]}")


if __name__ == "__main__":
    main()