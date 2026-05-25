import customtkinter as ctk
import datetime
import time
import threading
import csv
# --- Theme Configuration ---
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# Medical / Healthcare Dark Theme Colors
BG_COLOR = "#0f172a"        # Deep Slate for background
CARD_COLOR = "#1e293b"      # Lighter Slate for cards
ACCENT_COLOR = "#06b6d4"    # Cyan for primary highlights
TEXT_COLOR = "#f8fafc"      # White for standard text
MUTED_TEXT = "#94a3b8"      # Gray for secondary text

# Status Colors
HEALTHY_COLOR = "#10b981"   # Green
MODERATE_COLOR = "#eab308"  # Yellow/Amber
SEVERE_COLOR = "#ef4444"    # Red

class SAMDashboard(ctk.CTk):
    def __init__(self):
        super().__init__()
        
        self.title("AI-Powered SAM Detection System")
        self.geometry("1300x850")
        self.configure(fg_color=BG_COLOR)
        
        # Configure overall grid layout (Responsive structure)
        self.grid_rowconfigure(1, weight=1)
        self.grid_columnconfigure((1, 2), weight=1)
        self.grid_columnconfigure(0, weight=0, minsize=320)
        self.grid_columnconfigure(3, weight=0, minsize=350)
        
        self.setup_top_nav()
        self.setup_left_panel()
        self.setup_center_panel()
        self.setup_right_panel()
        self.setup_bottom_action()

    def setup_top_nav(self):
        # Top Navigation Bar
        top_frame = ctk.CTkFrame(self, fg_color=CARD_COLOR, corner_radius=0, height=70)
        top_frame.grid(row=0, column=0, columnspan=4, sticky="new")
        top_frame.grid_propagate(False)
        
        # App Title & Icon
        title_lbl = ctk.CTkLabel(top_frame, text="🏥 AI-Powered SAM Detection System", 
                                 font=ctk.CTkFont(family="Helvetica", size=24, weight="bold"), 
                                 text_color=ACCENT_COLOR)
        title_lbl.pack(side="left", padx=20, pady=15)
        
        # Status Indicators
        self.hardware_status = ctk.CTkLabel(top_frame, text="🟢 RPi Active | 🟢 Sensors Online", 
                                            font=ctk.CTkFont(size=14, weight="bold"), text_color=TEXT_COLOR)
        self.hardware_status.pack(side="left", padx=50, pady=15)
        
        # Real-time Clock
        self.time_lbl = ctk.CTkLabel(top_frame, text="", font=ctk.CTkFont(size=14, weight="bold"), text_color=MUTED_TEXT)
        self.time_lbl.pack(side="right", padx=30, pady=15)
        self.update_time()

    def update_time(self):
        current_time = datetime.datetime.now().strftime("%B %d, %Y - %H:%M:%S")
        self.time_lbl.configure(text=current_time)
        self.after(1000, self.update_time)

    def setup_left_panel(self):
        # Child Profile Section
        left_frame = ctk.CTkFrame(self, fg_color=CARD_COLOR, corner_radius=15)
        left_frame.grid(row=1, column=0, sticky="nsew", padx=20, pady=(20, 10))
        left_frame.grid_columnconfigure(0, weight=1)
        
        header = ctk.CTkLabel(left_frame, text="Child Profile", font=ctk.CTkFont(size=20, weight="bold"), text_color=TEXT_COLOR)
        header.grid(row=0, column=0, pady=(20, 10))
        
        # Image Display Area
        self.img_placeholder = ctk.CTkLabel(left_frame, text="[ Live Camera Feed ]\n\nCamera Module Not Initialized", 
                                            width=260, height=260, fg_color=BG_COLOR, corner_radius=15, 
                                            text_color=MUTED_TEXT, font=ctk.CTkFont(size=14))
        self.img_placeholder.grid(row=1, column=0, pady=10, padx=20)
        
        # Image Buttons
        btn_frame = ctk.CTkFrame(left_frame, fg_color="transparent")
        btn_frame.grid(row=2, column=0, pady=10)
        
        capture_btn = ctk.CTkButton(btn_frame, text="📷 Capture Image", width=120, fg_color=ACCENT_COLOR, 
                                    text_color=BG_COLOR, hover_color="#0891b2", font=ctk.CTkFont(weight="bold"),
                                    command=self.capture_image)
        capture_btn.grid(row=0, column=0, padx=5)
        
        upload_btn = ctk.CTkButton(btn_frame, text="📂 Upload", width=120, fg_color="transparent", 
                                   border_color=ACCENT_COLOR, border_width=1, hover_color="#164e63", 
                                   command=self.upload_image)
        upload_btn.grid(row=0, column=1, padx=5)
        
        # Profile Form Fields
        form_frame = ctk.CTkFrame(left_frame, fg_color="transparent")
        form_frame.grid(row=3, column=0, sticky="ew", padx=20, pady=15)
        
        self.child_id_entry = self.create_form_row(form_frame, "Child ID:", "SAM-001", 0)
        self.name_entry = self.create_form_row(form_frame, "Name:", "John Doe", 1)
        self.age_entry = self.create_form_row(form_frame, "Age (months):", "24", 2)
        
        # Gender Dropdown
        ctk.CTkLabel(form_frame, text="Gender:", font=ctk.CTkFont(size=14, weight="bold")).grid(row=3, column=0, sticky="w", pady=8)
        self.gender_var = ctk.StringVar(value="Male")
        gender_dropdown = ctk.CTkOptionMenu(form_frame, variable=self.gender_var, values=["Male", "Female"], 
                                            width=150, fg_color=BG_COLOR, button_color=ACCENT_COLOR, button_hover_color="#0891b2")
        gender_dropdown.grid(row=3, column=1, sticky="e", pady=8)

    def create_form_row(self, parent, label_text, default_val, row_idx):
        ctk.CTkLabel(parent, text=label_text, font=ctk.CTkFont(size=14, weight="bold")).grid(row=row_idx, column=0, sticky="w", pady=8)
        entry = ctk.CTkEntry(parent, width=150, fg_color=BG_COLOR, border_color="#334155")
        entry.insert(0, default_val)
        entry.grid(row=row_idx, column=1, sticky="e", pady=8)
        return entry

    def setup_center_panel(self):
        # Sensor & Anthropometric Readings
        center_frame = ctk.CTkFrame(self, fg_color="transparent")
        center_frame.grid(row=1, column=1, columnspan=2, sticky="nsew", padx=10, pady=(20, 10))
        
        header = ctk.CTkLabel(center_frame, text="Sensor & Anthropometric Readings", 
                              font=ctk.CTkFont(size=20, weight="bold"), text_color=TEXT_COLOR)
        header.pack(anchor="w", pady=(0, 15), padx=10)
        
        # Metrics Cards Grid
        cards_frame = ctk.CTkFrame(center_frame, fg_color="transparent")
        cards_frame.pack(fill="both", expand=True)
        cards_frame.grid_columnconfigure((0, 1), weight=1)
        
        self.sensor_vars = {}
        
        metrics = [
            ("Height (cm)", "85.2", 0, 0, "📏"),
            ("Weight (kg)", "11.5", 0, 1, "⚖️"),
            ("BMI", "15.8", 1, 0, "📊"),
            ("Head Circ. (cm)", "48.0", 1, 1, "🧠"),
            ("Waist Length (cm)", "45.0", 2, 0, "📏"),
            ("Knee Height (cm)", "25.0", 2, 1, "🦵"),
            ("Arm Length (cm)", "35.0", 3, 0, "💪"),
            ("MUAC (cm)", "12.5", 3, 1, "⚕️") # Mid-Upper Arm Circumference
        ]
        
        for title, val, r, c, icon in metrics:
            card = ctk.CTkFrame(cards_frame, fg_color=CARD_COLOR, corner_radius=12, height=105)
            card.grid(row=r, column=c, padx=10, pady=10, sticky="nsew")
            card.grid_propagate(False)
            
            lbl_title = ctk.CTkLabel(card, text=f"{icon}  {title}", font=ctk.CTkFont(size=14, weight="bold"), text_color=MUTED_TEXT)
            lbl_title.pack(anchor="nw", padx=15, pady=(15, 0))
            
            var = ctk.StringVar(value=val)
            self.sensor_vars[title] = var
            
            val_entry = ctk.CTkEntry(card, textvariable=var, font=ctk.CTkFont(size=28, weight="bold"), 
                                     text_color=ACCENT_COLOR, fg_color="transparent", border_width=0, justify="left")
            val_entry.pack(anchor="sw", padx=10, pady=(0, 5))
            
            # Simulated sensor progress bar
            pb = ctk.CTkProgressBar(card, height=4, fg_color=BG_COLOR, progress_color=ACCENT_COLOR)
            pb.pack(fill="x", padx=15, pady=(0, 15), side="bottom")
            pb.set(float(val) / 100.0 if float(val) < 100 else 0.8)

    def setup_right_panel(self):
        # AI Prediction Results Section
        right_frame = ctk.CTkFrame(self, width=350, fg_color=CARD_COLOR, corner_radius=15)
        right_frame.grid(row=1, column=3, sticky="nsew", padx=20, pady=(20, 10))
        right_frame.grid_columnconfigure(0, weight=1)
        
        header = ctk.CTkLabel(right_frame, text="AI Prediction Results", font=ctk.CTkFont(size=20, weight="bold"), text_color=TEXT_COLOR)
        header.pack(pady=(20, 20))
        
        # Main Prediction Status Card
        self.status_card = ctk.CTkFrame(right_frame, fg_color=SEVERE_COLOR, corner_radius=15)
        self.status_card.pack(fill="x", padx=20, pady=10)
        
        self.status_lbl = ctk.CTkLabel(self.status_card, text="Severe Acute\nMalnutrition",width=250, 
                                       font=ctk.CTkFont(size=26, weight="bold"), text_color="white")
        self.status_lbl.pack(pady=30)
        
        # Details section
        details_frame = ctk.CTkFrame(right_frame, fg_color="transparent")
        details_frame.pack(fill="both", expand=True, padx=20, pady=15)
        
        # Key-Value Display helper
        def add_detail(row, label, default_val, val_color):
            ctk.CTkLabel(details_frame, text=label, font=ctk.CTkFont(size=14, weight="bold"), text_color=MUTED_TEXT).grid(row=row, column=0, sticky="w", pady=12)
            val_lbl = ctk.CTkLabel(details_frame, text=default_val, text_color=val_color, font=ctk.CTkFont(size=16, weight="bold"))
            val_lbl.grid(row=row, column=1, sticky="e", pady=12)
            return val_lbl
            
        details_frame.grid_columnconfigure(1, weight=1)
        self.risk_val = add_detail(0, "Risk Level:", "HIGH", SEVERE_COLOR)
        self.conf_val = add_detail(1, "Confidence Score:", "98.5%", ACCENT_COLOR)
        self.zscore_val = add_detail(2, "WHO Z-Score:", "<-3 SD", SEVERE_COLOR)
        
        # Recommendation Textbox
        ctk.CTkLabel(details_frame, text="AI Recommendation:", font=ctk.CTkFont(size=14, weight="bold"), text_color=TEXT_COLOR).grid(row=3, column=0, columnspan=2, sticky="w", pady=(20, 5))
        self.rec_box = ctk.CTkTextbox(details_frame, height=120, fg_color=BG_COLOR, text_color=TEXT_COLOR, corner_radius=10, font=ctk.CTkFont(size=13))
        self.rec_box.grid(row=4, column=0, columnspan=2, sticky="nsew")
        self.rec_box.insert("0.0", "Immediate medical intervention required. Admit to inpatient therapeutic feeding program (ITFP). Initiate F-75 therapeutic milk formula.")
        self.rec_box.configure(state="disabled")

    def setup_bottom_action(self):
        # Bottom Action Buttons
        bottom_frame = ctk.CTkFrame(self, fg_color=CARD_COLOR, corner_radius=15, height=90)
        bottom_frame.grid(row=2, column=0, columnspan=4, sticky="ew", padx=20, pady=(10, 20))
        bottom_frame.grid_propagate(False)
        
        btn_container = ctk.CTkFrame(bottom_frame, fg_color="transparent")
        btn_container.pack(expand=True, fill="both", padx=20, pady=20)
        
        btn_style = {"height": 50, "font": ctk.CTkFont(size=15, weight="bold"), "corner_radius": 10}
        
        # Grid layout for buttons for better spacing
        btn_container.grid_columnconfigure((0,1,2,3,4), weight=1)
        
        scan_btn = ctk.CTkButton(btn_container, text="📡 Start Sensor Scan", fg_color=BG_COLOR, 
                                 border_color=ACCENT_COLOR, border_width=2, hover_color="#164e63", 
                                 command=self.start_scan, **btn_style)
        scan_btn.grid(row=0, column=0, padx=10, sticky="ew")
        
        predict_btn = ctk.CTkButton(btn_container, text="🧠 Predict SAM", fg_color=ACCENT_COLOR, 
                                    text_color=BG_COLOR, hover_color="#0891b2", 
                                    command=self.predict_sam, **btn_style)
        predict_btn.grid(row=0, column=1, padx=10, sticky="ew")
        
        rec_btn = ctk.CTkButton(btn_container, text="📋 Generate Recommendation", fg_color="#3b82f6", 
                                hover_color="#2563eb", command=self.generate_rec, **btn_style)
        rec_btn.grid(row=0, column=2, padx=10, sticky="ew")
        
        save_btn = ctk.CTkButton(btn_container, text="💾 Save Report", fg_color=HEALTHY_COLOR, 
                                 hover_color="#059669", command=self.save_report, **btn_style)
        save_btn.grid(row=0, column=3, padx=10, sticky="ew")
        
        clear_btn = ctk.CTkButton(btn_container, text="🗑️ Clear Data", fg_color="transparent", 
                                  border_color=SEVERE_COLOR, border_width=2, text_color=SEVERE_COLOR, 
                                  hover_color="#451a1a", command=self.clear_data, **btn_style)
        clear_btn.grid(row=0, column=4, padx=10, sticky="ew")

    # --- Backend Integration Placeholders ---

    def capture_image(self):
        print("[System] Capturing image from Pi Camera...")
        self.img_placeholder.configure(text="[ Image Captured ]", text_color=ACCENT_COLOR)

    def upload_image(self):
        print("[System] Opening file dialog to upload image...")
        
    def start_scan(self):
        print("[System] Initiating Ultrasonic and Load Cell sensors...")
        self.hardware_status.configure(text="⏳ Scanning...", text_color=MODERATE_COLOR)
        # Simulate scan delay
        self.after(2000, lambda: self.hardware_status.configure(text="🟢 RPi Active | 🟢 Sensors Online", text_color=TEXT_COLOR))
        
    def predict_sam(self):
        print("[System] Connecting to prediction.py backend...")
        try:
            from prediction import predict_sam
            
            # Fetch values from GUI
            age = float(self.age_entry.get())
            weight = float(self.sensor_vars["Weight (kg)"].get())
            height = float(self.sensor_vars["Height (cm)"].get())
            
            # Call backend
            result = predict_sam(weight, height, age)
            
            # Update GUI based on prediction results
            category = result["Category"]
            from recommendation import generate_recommendation
            
            rec_data = generate_recommendation(category)
            risk = result["Risk"]
            bmi = result["BMI"]
            
            if category == "Healthy":
                self.status_card.configure(fg_color=HEALTHY_COLOR)
                self.status_lbl.configure(text=f"{category}\nNormal Nutrition")
                self.risk_val.configure(text=risk.upper(), text_color=HEALTHY_COLOR)
                self.zscore_val.configure(text=rec_data["zscore"], text_color=HEALTHY_COLOR)
                self.conf_val.configure(text=rec_data["confidence"], text_color=HEALTHY_COLOR)
                
                self.rec_box.configure(state="normal")
                self.rec_box.delete("0.0", "end")
                self.rec_box.insert("0.0", rec_data["recommendation"])
                self.rec_box.configure(state="disabled")
            
            elif category == "Moderate Malnutrition":
                self.status_card.configure(fg_color=MODERATE_COLOR)
                self.status_lbl.configure(text=f"Moderate\nMalnutrition")
                self.risk_val.configure(text=risk.upper(), text_color=MODERATE_COLOR)
                self.zscore_val.configure(text=rec_data["zscore"], text_color=MODERATE_COLOR)
                self.conf_val.configure(text=rec_data["confidence"], text_color=MODERATE_COLOR)
                
                self.rec_box.configure(state="normal")
                self.rec_box.delete("0.0", "end")
                self.rec_box.insert("0.0", rec_data["recommendation"])
                self.rec_box.configure(state="disabled")
                
            else: # Severe Acute Malnutrition
                self.status_card.configure(fg_color=SEVERE_COLOR)
                self.status_lbl.configure(text=f"Severe Acute\nMalnutrition")
                self.risk_val.configure(text=risk.upper(), text_color=SEVERE_COLOR)
                self.zscore_val.configure(text=rec_data["zscore"], text_color=SEVERE_COLOR)
                self.conf_val.configure(text=rec_data["confidence"], text_color=SEVERE_COLOR)
                
                self.rec_box.configure(state="normal")
                self.rec_box.delete("0.0", "end")
                self.rec_box.insert("0.0", rec_data["recommendation"])
                self.rec_box.configure(state="disabled")
                
            print(f"[System] Prediction Complete: {category} (BMI: {bmi})")
            
        except Exception as e:
            print(f"[Error] Failed to run prediction: {e}")
        
    def generate_rec(self):
        print("[System] Generating detailed AI recommendation...")
        
    def save_report(self):
        
        try:
            from prediction import predict_sam
            from recommendation import generate_recommendation

            # Collect GUI data
            child_id = self.child_id_entry.get()
            name = self.name_entry.get()
            age = self.age_entry.get()
            gender = self.gender_var.get()
            height = self.sensor_vars["Height (cm)"].get()
            weight = self.sensor_vars["Weight (kg)"].get()

            # Run prediction again for latest values
            result = predict_sam(float(weight), float(height), float(age))

            category = result["Category"]
            bmi = result["BMI"]
            risk = result["Risk"]

            rec_data = generate_recommendation(category)

            recommendation = rec_data["recommendation"]
            confidence = rec_data["confidence"]
            zscore = rec_data["zscore"]

            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # CSV file
            filename = "sam_reports.csv"

            with open(filename, mode="a", newline="") as file:
                writer = csv.writer(file)

                if file.tell() == 0:
                    writer.writerow([
                        "Timestamp",
                        "Child ID",
                        "Name",
                        "Age",
                        "Gender",
                        "Height",
                        "Weight",
                        "BMI",
                        "Category",
                        "Risk",
                        "Confidence",
                        "WHO Z-Score",
                        "Recommendation"
                    ])

                # Write row
                writer.writerow([
                    timestamp,
                    child_id,
                    name,
                    age,
                    gender,
                    height,
                    weight,
                    bmi,
                    category,
                    risk,
                    confidence,
                    zscore,
                    recommendation
                ])

            print(f"[System] Report Saved Successfully -> {filename}")

            self.hardware_status.configure(
                text="✅ Report Saved Successfully",
                text_color=HEALTHY_COLOR
            )

        except Exception as e:    
            print(f"[Error] Failed to save report: {e}")

            self.hardware_status.configure(
            text="❌ Failed To Save Report",
            text_color=SEVERE_COLOR
        )
        
    def clear_data(self):
        print("[System] Clearing form data...")
        self.child_id_entry.delete(0, "end")
        self.name_entry.delete(0, "end")
        self.age_entry.delete(0, "end")
        
        self.status_card.configure(fg_color=CARD_COLOR)
        self.status_lbl.configure(text="Awaiting\nPrediction")
        for var in self.sensor_vars.values():
            var.set("0.0")
        self.rec_box.configure(state="normal")
        self.rec_box.delete("0.0", "end")
        self.rec_box.configure(state="disabled")

        self.risk_val.configure(text="-")
        self.conf_val.configure(text="-")
        self.zscore_val.configure(text="-")

if __name__ == "__main__":
    app = SAMDashboard()
    app.mainloop()
