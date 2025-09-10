# 🩸 Emergency Blood Tracker  

During medical emergencies, finding the right blood type at the right time is critical. Patients and families often struggle to contact multiple blood banks and donors manually, which delays treatment.  

The **Emergency Blood Tracker** provides a **centralized platform** where hospitals, patients, and donors can connect instantly.  

✅ **Example:**  
- A hospital urgently needs **O+ blood**.  
- The system instantly shows **nearby available donors and blood banks**.  
- Contact happens immediately, saving precious time and lives.  

---

## 🚀 Features  
- Real-time **donor and blood bank availability tracking**  
- Role-based access for **donors, hospitals, and patients**  
- **Search by blood group & location**  
- Secure **authentication system** (registration & login)  
- **Automated notifications** for urgent requests  
- Easy-to-use **frontend interface** integrated with backend APIs  
- Scalable deployment with **Docker & Kubernetes**  

---

## 🔗 Example Scenario  
Instead of manually calling multiple places, users can search directly:  
- "Find B+ donors in Hyderabad"  
- "Check O- stock in nearby blood banks"  

---

## 📖 Conclusion  
The **Emergency Blood Tracker** is a life-saving healthcare application that makes blood donation **faster, smarter, and more reliable**.  

It is especially useful for:  
- 🏥 **Hospitals & Clinics**  
- 🧑‍🤝‍🧑 **Patients & Families**  
- 🩸 **Blood Banks**  
- 🙌 **Voluntary Donors**  

💡 With **real-time notifications, location-based search, and cloud deployment**, it has the potential to become a **production-grade healthcare service**.  

---

# ✨ Members’ Contribution Summary  

👩‍💻 **B. Harshitha (23211A6713)**  
1. GitHub Repository & Version Control  
2. Set up project repo & managed branching strategy  
3. Resolved merge conflicts  
4. Reviewed and merged pull requests  

👩‍💻 **G. Navya (23211A6735)**  
1. Frontend Development – Built responsive UI using HTML, CSS, JS  
2. Designed search forms for blood type & location queries  
3. Client-side validations & error handling  
4. Integrated frontend with backend APIs  

👩‍💻 **Kamakshi (23211A6746)**  
1. Testing (Manual + Automated)  
2. Manual testing of donor/hospital workflows  
3. Automated testing using Selenium & Postman  
4. Prepared test cases & ensured system reliability  

👩‍💻 **Swetha (23211A6703)**  
1. Jenkins CI/CD Integration  
2. Configured GitHub integration  
3. Set up pipeline for build, test, and deployment  
4. Notifications for build failures/success  

👩‍💻 **J. Harshitha (23211A6740)**  
1. Docker & Kubernetes Deployment  
2. Created Dockerfile & containerized the app  
3. Designed Kubernetes deployment & service files  
4. Planned scaling strategies for high demand  

👩‍💻 **G. Harshitha (24215A6707)**  
1. Cloud & Deployment (AWS/Azure/GCP)  
2. Configured cloud environment for hosting  
3. Planned production deployment on AWS  
4. Managed environment variables & database connections  

---

## 📌 Project Progress (as of now)  
- ✅ Frontend pages completed (HTML, CSS, JS)  
- ✅ GitHub repository created & code pushed  
- ✅ Jenkins setup started (GitHub integration is done)  
- 🔲 Backend APIs (Node.js / Python Flask) completed  
- 🔲 Database setup (MySQL/MongoDB) completed  
- 🔲 Docker + Kubernetes deployment → pending  
- 🔲 Automated testing (Selenium/Unit Testing) → pending  

---

## 🛠 Tech Stack  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Version Control:** GitHub  
- **CI/CD:** Jenkins  
- **Containerization:** Docker  
- **Orchestration:** Kubernetes  
- **Cloud Deployment:** AWS (planned)  
- **Testing Tools:** Selenium, Postman, Manual Testing  

---

## 🚀 Next Steps  
1. Deploy application using **Docker & Kubernetes**.  
2. Host application on **AWS Cloud**.  
3. Final testing on production setup.  

---

## 📷 Screenshots  
<img width="1902" height="868" alt="image" src="https://github.com/user-attachments/assets/a67cc44e-14be-4d5b-9de3-2bbcc732f90a" />  
<img width="1890" height="883" alt="Screenshot 2025-08-27 111520" src="https://github.com/user-attachments/assets/ca4b61cf-f583-425b-9d26-c1c6bf2af23a" />  
<img width="1491" height="866" alt="Screenshot 2025-08-27 111538" src="https://github.com/user-attachments/assets/6e0c64a4-e4b8-4e4c-ae10-64ee6d643651" />  
<img width="1530" height="674" alt="Screenshot 2025-08-27 111606" src="https://github.com/user-attachments/assets/452697a3-1f8d-4c28-8876-9056a4776fef" />  
<img width="1529" height="707" alt="Screenshot 2025-08-27 111622" src="https://github.com/user-attachments/assets/0839bc77-68b2-439b-89be-b71d1cd129e3" />  
<img width="1895" height="859" alt="image" src="https://github.com/user-attachments/assets/bc367569-f594-4498-94e2-a9e826d5dbe3" />  
<img width="1896" height="864" alt="Screenshot 2025-08-27 112124" src="https://github.com/user-attachments/assets/0540a783-94b7-4705-98a3-fb998f406d20" />  
<img width="994" height="814" alt="Screenshot 2025-08-27 112233" src="https://github.com/user-attachments/assets/85d84bb1-15ab-440e-9ed8-e59b6e514c75" />  
<img width="1898" height="859" alt="Screenshot 2025-08-27 111045" src="https://github.com/user-attachments/assets/c10b74a9-6c5f-4777-93eb-35caca83d025" />  

---

# 🐳 Running with Docker  

This project includes a `Dockerfile` so you can run it easily inside a container.  

---

## 🔹 For Other Developers (Pull & Run Image)  

### 1. Login to Docker Hub:  
```bash
docker login

# 2. Pull the image from Docker Hub
docker pull team5/emergency-blood-tracker:latest

# 3. Run the container with environment file
docker run --env-file backend/.env -p 5000:5000 team5/emergency-blood-tracker:latest

# 4. Check running containers
docker ps

# 5. View container logs (optional)
docker logs -f blood-tracker-container

✅ Now the service will be running at:
👉 http://localhost:5000/
 (or the port you exposed)

## 👥 Contributors  

Made by **Team 5**  

| Name         | Roll Number  |
|--------------|--------------|
| Swetha       | 23211A6703   |
| B. Harshitha | 23211A6713   |
| G. Navya     | 23211A6735   |
| J. Harshitha | 23211A6740   |
| Kamakshi     | 23211A6746   |
| G. Harshitha | 24215A6707   |
