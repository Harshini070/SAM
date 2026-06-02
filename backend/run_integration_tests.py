import sys
import os
import requests
from datetime import datetime

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except AttributeError:
        pass

# Initialize connection details
BASE_URL = "http://localhost:8000"

print("====================================================")
print(" RUNTIME USER-FLOW VERIFICATION & MANUAL TEST MOCK")
print("====================================================")

# Set test variables
TEST_PHONE = "9876543210"
token = None
child_id = None

# Helper: print stage header
def print_stage(name):
    print(f"\n--- [STAGE] {name} ---")

# 1. REQUEST & VERIFY OTP (Login Flow)
print_stage("Login / Verify OTP Flow")

# 1a. Request OTP
try:
    resp = requests.post(f"{BASE_URL}/api/auth/parent/request-otp", json={"phone": TEST_PHONE})
    if resp.status_code == 200:
        print("SUCCESS: OTP Request Endpoint (200)")
    else:
        print(f"ERROR: OTP Request Endpoint Failed: Status {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Connection to backend failed: {e}")
    sys.exit(1)

# 1b. Retrieve OTP Code from Backend test endpoint
try:
    resp = requests.get(f"{BASE_URL}/api/auth/test/get-otp?phone={TEST_PHONE}")
    if resp.status_code == 200:
        otp_code = resp.json()["code"]
        print(f"SUCCESS: Retrieved generated OTP from API endpoint: {otp_code}")
    else:
        print(f"ERROR: Failed to retrieve OTP from API: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Failed to retrieve OTP: {e}")
    sys.exit(1)

# 1c. Verify OTP
try:
    resp = requests.post(f"{BASE_URL}/api/auth/parent/verify-otp", json={"phone": TEST_PHONE, "code": otp_code})
    if resp.status_code == 200:
        res_data = resp.json()
        token = res_data["access_token"]
        print("SUCCESS: OTP Verification Successful: Token acquired")
    else:
        print(f"ERROR: OTP Verification Failed: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: OTP Verification Exception: {e}")
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 2. VIEW CURRENT PROFILE INFO
print_stage("Fetch Caregiver Profile Info")
try:
    resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    if resp.status_code == 200:
        user_info = resp.json()
        print(f"SUCCESS: Profile loaded. Caregiver Name: '{user_info.get('name')}', District: '{user_info.get('district')}'")
    else:
        print(f"ERROR: Failed to fetch user info: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Fetch User Info Exception: {e}")
    sys.exit(1)

# 3. REGISTER CHILD
print_stage("Register New Child")
# Setup unique name and ID
test_child_name = f"Test Child {int(datetime.utcnow().timestamp())}"
register_payload = {
    "name": test_child_name,
    "dob": "2024-05-12T00:00:00",
    "gender": "M",
    "mother_name": user_info.get('name') or "Caregiver",
    "mother_phone": TEST_PHONE,
    "weight": 7.8,
    "height": 68.0,
    "muac": 112.0,
    "district": user_info.get('district') or "Raipur",
    "village": "Test Village"
}

try:
    resp = requests.post(f"{BASE_URL}/api/children/register", json=register_payload, headers=headers)
    if resp.status_code == 200 or resp.status_code == 201:
        child_res = resp.json()
        child_id = child_res.get("child_id")
        print(f"SUCCESS: Child Registration API Success. Registered Name: '{test_child_name}', Generated child_id: '{child_id}'")
    else:
        print(f"ERROR: Child Registration Failed: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Child Registration Exception: {e}")
    sys.exit(1)

# 4. VIEW CHILDREN LIST & SWITCH CHILDREN
print_stage("List Children & Switch Profiles")
try:
    resp = requests.get(f"{BASE_URL}/api/children/by-mother/{TEST_PHONE}", headers=headers)
    if resp.status_code == 200:
        res_json = resp.json()
        children_list = res_json.get("children", [])
        print(f"SUCCESS: Fetched Children List: Found {len(children_list)} child profiles registered to this phone number")
        for ch in children_list:
            print(f"  - Name: {ch.get('name')}, ID: {ch.get('child_id')}, Status: {ch.get('health_status')}")
        
        # Verify the newly registered child is in the list
        matched = [c for c in children_list if c["child_id"] == child_id]
        if matched:
            print(f"SUCCESS: Confirmed: Registered Child '{test_child_name}' matches current children list")
        else:
            print("ERROR: Registered Child is missing from the by-mother children list!")
            sys.exit(1)
    else:
        print(f"ERROR: Children List Fetch Failed: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Children List Exception: {e}")
    sys.exit(1)

# 5. VIEW CHILD DETAILS
print_stage("Fetch Child Profile Details & Growth Trends")
try:
    resp = requests.get(f"{BASE_URL}/api/children/{child_id}", headers=headers)
    if resp.status_code == 200:
        details = resp.json()
        print(f"SUCCESS: Child details endpoint success for ID '{child_id}'")
        print(f"  - Vitals: Weight: {details.get('weight')} kg, Height: {details.get('height')} cm, MUAC: {details.get('muac')} mm")
        print(f"  - Growth History entries: {len(details.get('growth_history', []))}")
    else:
        print(f"ERROR: Failed to fetch child details: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Fetch details exception: {e}")
    sys.exit(1)

# 6. EDIT PROFILE (Update Name)
print_stage("Update Caregiver Profile Name")
new_name = "Harshini Sharma"
try:
    resp = requests.put(f"{BASE_URL}/api/auth/profile", json={"name": new_name}, headers=headers)
    if resp.status_code == 200:
        print(f"SUCCESS: Profile Update Endpoint Success (Name changed to: '{new_name}')")
        
        # Verify from /api/auth/me
        me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        me_data = me_resp.json()
        if me_data.get("name") == new_name:
            print("SUCCESS: Verified: Caregiver profile name updated successfully in database")
        else:
            print(f"ERROR: Name mismatch in database: {me_data.get('name')}")
            sys.exit(1)
    else:
        print(f"ERROR: Profile Update Failed: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Profile update exception: {e}")
    sys.exit(1)

# 7. UPDATE DISTRICT
print_stage("Update Caregiver Registered District")
new_district = "Bastar"
try:
    resp = requests.put(f"{BASE_URL}/api/auth/profile", json={"district": new_district}, headers=headers)
    if resp.status_code == 200:
        print(f"SUCCESS: Profile Update Endpoint Success (District changed to: '{new_district}')")
        
        # Verify from /api/auth/me
        me_resp = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        me_data = me_resp.json()
        if me_data.get("district") == new_district:
            print("SUCCESS: Verified: Caregiver district updated successfully in database")
        else:
            print(f"ERROR: District mismatch in database: {me_data.get('district')}")
            sys.exit(1)
    else:
        print(f"ERROR: Profile Update Failed: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: District update exception: {e}")
    sys.exit(1)

# 8. VIEW ALERTS & NOTIFICATIONS
print_stage("Fetch Notifications History & Update Statuses")
try:
    resp = requests.get(f"{BASE_URL}/api/alerts/my-alerts", headers=headers)
    if resp.status_code == 200:
        alerts_data = resp.json()
        alerts_list = alerts_data.get("alerts", [])
        print(f"SUCCESS: Notifications Endpoint Success: Loaded {len(alerts_list)} alerts for caregiver phone")
        for alert in alerts_list[:2]:
            print(f"  - Title: {alert.get('title')}, Msg: {alert.get('message')}")
            
        if alerts_list:
            target_alert_id = alerts_list[0]["_id"]
            
            # STAGE 8b. Mark single alert as read
            print("\n  - Sub-stage: Mark alert as read...")
            read_resp = requests.put(f"{BASE_URL}/api/alerts/{target_alert_id}/read", headers=headers)
            if read_resp.status_code == 200:
                print(f"  SUCCESS: Alert {target_alert_id} marked as read")
            else:
                print(f"  ERROR: Failed to mark alert read: {read_resp.status_code}, {read_resp.text}")
                sys.exit(1)
                
            # STAGE 8c. Mark all alerts as read
            print("  - Sub-stage: Mark all alerts as read...")
            read_all_resp = requests.put(f"{BASE_URL}/api/alerts/read-all", headers=headers)
            if read_all_resp.status_code == 200:
                print("  SUCCESS: Marked all user alerts as read")
            else:
                print(f"  ERROR: Failed to mark all read: {read_all_resp.status_code}, {read_all_resp.text}")
                sys.exit(1)
                
            # STAGE 8d. Clear all alerts
            print("  - Sub-stage: Clear all alerts...")
            clear_resp = requests.delete(f"{BASE_URL}/api/alerts/clear-all", headers=headers)
            if clear_resp.status_code == 200:
                print("  SUCCESS: Cleared/deleted all alerts for user")
            else:
                print(f"  ERROR: Failed to clear all alerts: {clear_resp.status_code}, {clear_resp.text}")
                sys.exit(1)
    else:
        print(f"ERROR: Failed to fetch notifications: {resp.status_code}, {resp.text}")
        sys.exit(1)
except Exception as e:
    print(f"ERROR: Notifications fetch exception: {e}")
    sys.exit(1)

print("\n====================================================")
print(" ALL TESTS PASSED: Parent Portal APIs are 100% Functional!")
print("====================================================")
