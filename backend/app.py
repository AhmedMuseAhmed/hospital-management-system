from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://ahmedmuseahmed@localhost/hospital_db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = "hospital-secret-key"

jwt = JWTManager(app)

db = SQLAlchemy(app)

## User Model ##
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default="admin")

## Patient Model ##
class Patient(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    address = db.Column(db.String(200))

## Doctors Model ##
class Doctor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    specialization = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), nullable=False)

## Appointment Model ##
class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    patient_id = db.Column(
        db.Integer, db.ForeignKey('patient.id'), nullable=False
    )

    doctor_id = db.Column(
        db.Integer, db.ForeignKey("doctor.id"), nullable=False
    )

    appointment_date = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="Pending")

    patient = db.relationship("Patient", backref="appointments")
    doctor = db.relationship("Doctor", backref="appointments")

## Department Model ##
class Department(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))



with app.app_context():
    db.create_all()

## Home route ##
@app.route("/")
def home():
    return jsonify({
        "message": "Hospital Management System API is running!",
        "database": "PostgreSQL is connected successfully!"
    })

## Register Route ##
@app.route('/register', methods=['POST'])
def register():

    data = request.get_json()

    existing_user = User.query.filter_by(email=data['email']).first()

    if existing_user:
        return jsonify({
            "error": "Email already registered"
        }), 404
    
    hashed_password = generate_password_hash(data['password'])

    new_user= User(
        full_name=data['full_name'],
        email=data['email'],
        password=hashed_password,
        role=data.get('role', 'admin')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully"
    }), 201

## Login Route ##
@app.route('/login', methods=['POST'])
def login():

    data = request.get_json()

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401
    
    if not check_password_hash(user.password, data['password']):
        return jsonify({
            "error": "Invalid email or password"
        }), 401
    
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role
        }
    })

## Patient Routes ##
@app.route('/patients', methods=['POST'])
def create_patient():
    data = request.get_json()

    new_patient = Patient(
        full_name=data['full_name'],
        age=data['age'],
        gender=data['gender'],
        phone=data['phone'],
        address=data.get('address')
    )

    db.session.add(new_patient)
    db.session.commit()

    return jsonify({
        "message": "Patient created successfully!",
        "patient": {
            "id": new_patient.id,
            "full_name": new_patient.full_name,
            "age": new_patient.age,
            "gender": new_patient.gender,
            "phone": new_patient.phone,
            "address": new_patient.address
        }
    }), 201


@app.route('/patients', methods=['GET'])
def get_patients():

    patients = Patient.query.all()

    result = []

    for patient in patients:
        result.append({
            "id": patient.id,
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone,
            "address": patient.address
        })

    return jsonify(result)
    

@app.route('/patients/<int:id>', methods=['GET'])
def get_patient(id):

    patient = Patient.query.get(id)

    if not patient:
        return jsonify({
            "error": "Pati@ent not found"
        }), 404
    
    return jsonify({
        "id": patient.id,
        "full_name": patient.full_name,
        "age": patient.age,
        "gender": patient.gender,
        "phone": patient.phone,
        "address": patient.address
    })


@app.route('/patients/<int:id>', methods=['PUT'])
def update_patient(id):

    patient = Patient.query.get(id)

    if not patient:
        return jsonify({
            "error": "Patient not found"
        }), 404
    
    data = request.get_json()

    patient.full_name = data.get( "full_name", patient.full_name)
    patient.age = data.get("age", patient.age)
    patient.gender = data.get("gender", patient.gender) 
    patient.phone = data.get("phone", patient.phone)
    patient.address = data.get("address", patient.address)

    db.session.commit()

    return jsonify({
        "message": "Patient updated successfully",
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone,
            "address": patient.address
        }
    })

@app.route('/patients/<int:id>', methods=['DELETE'])
def delete_patient(id):

    patient = Patient.query.get(id)

    if not patient:
        return jsonify({
            "error": "Patient not found"
        }), 404
    
    db.session.delete(patient)
    db.session.commit()

    return jsonify({
        "message": "Patient deleted successfully"
    })



## Doctor Routes ##
@app.route('/doctors', methods=['POST'])
def create_doctor():

    data = request.get_json()

    new_doctor = Doctor(
        full_name = data['full_name'],
        specialization=data['specialization'],
        phone=data['phone'],
        email=data['email']
    )

    db.session.add(new_doctor)
    db.session.commit()

    return jsonify({
        "message": "Doctor created successfully",
        "doctor": {
            "id": new_doctor.id,
            "full_name": new_doctor.full_name,
            "specialization": new_doctor.specialization,
            "phone": new_doctor.phone,
            "email": new_doctor.email
        }
    }), 201


@app.route('/doctors', methods=['GET'])
def get_doctors():

    doctors = Doctor.query.all()

    result =[]

    for doctor in doctors:
        result.append({
            "id": doctor.id,
            "full_name": doctor.full_name,
            "specialization": doctor.specialization,
            "phone": doctor.phone,
            "email": doctor.email
        })

    return jsonify(result)


@app.route('/doctors/<int:id>', methods=['GET'])
def get_doctor(id):

    doctor = Doctor.query.get(id)

    if not doctor:
        return jsonify({
            "error": "Doctor not found"
        }), 404
    
    return jsonify({
        "id": doctor.id,
        "full_name": doctor.full_name,
        "specialization": doctor.specialization,
        "phone": doctor.phone,
        "email": doctor.email
    })

@app.route('/doctors/<int:id>', methods=['PUT'])
def update_doctor(id):

    doctor = Doctor.query.get(id)

    if not doctor:
        return jsonify({
            "error": "Doctor not found"
        }), 404
    
    data = request.get_json()

    doctor.full_name = data.get("full_name", doctor.full_name)
    doctor.specialization = data.get("specialization", doctor.specialization)
    doctor.phone = data.get("phone", doctor.phone)
    doctor.email = data.get("email", doctor.email)

    db.session.commit()

    return jsonify({
        "message": "Doctor updated successfully",
        "doctor": {
            "id": doctor.id,
            "full_name": doctor.full_name,
            "specialization": doctor.specialization,
            "phone": doctor.phone,
            "email": doctor.email
        }
    })


@app.route('/doctors/<int:id>', methods=['DELETE'])
def delete_doctor(id):

    doctor = Doctor.query.get(id)

    if not doctor:
        return jsonify({
            "error": "Doctor not found"
        }), 404
    
    db.session.delete(doctor)
    db.session.commit()

    return jsonify({
        "message": "Doctor deleted successfully"
    })

## Appointment Routes ##
@app.route('/appointments', methods=['POST'])
def create_appointment():

    data = request.get_json()

    patient = Patient.query.get(data["patient_id"])

    if not patient:
        return jsonify({
            "error": "Patient not found"
        }), 404
    
    doctor = Doctor.query.get(data["doctor_id"])

    if not doctor:
        return jsonify({
            "error": "Doctor not found"
        }), 404
    
    appointment = Appointment(
        patient_id = data['patient_id'],
        doctor_id = data['doctor_id'],
        appointment_date = data['appointment_date'],
        status = data.get("status", "Pending")
    )

    db.session.add(appointment)
    db.session.commit()

    return jsonify({
        "message": "Appointment created successfully",
        "appointment": {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "doctor_id": appointment.doctor_id,
            "appointment_date": appointment.appointment_date,
            "status": appointment.status
        }
    }), 201


@app.route('/appointments', methods=['GET'])
def get_appointments():

    appointments = Appointment.query.all()

    result =[]

    for appointment in appointments:
        result.append({
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient.full_name,
            "doctor_id": appointment.doctor_id,
            "doctor_name": appointment.doctor.full_name,
            "doctor_specialization": appointment.doctor.specialization,
            "appointment_date": appointment.appointment_date,
            "status": appointment.status
        })

    return jsonify(result)


@app.route('/appointments/<int:id>', methods=['GET'])
def get_appointment(id):

    appointment = Appointment.query.get(id)

    if not appointment:
        return jsonify({
            "error": "Appointment not found"
        }), 404
    
    return jsonify({
        "id": appointment.id,
        "patient_id": appointment.patient_id,
        "patient_name": appointment.patient.full_name,
        "doctor_id": appointment.doctor_id,
        "doctor_name": appointment.doctor.full_name,
        "doctor_specialization": appointment.doctor.specialization,
        "appointment_date": appointment.appointment_date,
        "status": appointment.status
    })

@app.route('/appointments/<int:id>', methods=['PUT'])
def update_appointment(id):

    appointment = Appointment.query.get(id)

    if not appointment:
        return jsonify({
            "error": "Appointment not found"
        }), 404

    data = request.get_json()

    if "patient_id" in data:
        patient = Patient.query.get(data["patient_id"])

        if not patient:
            return jsonify({
                "error": "Patient not found"
            }), 404

        appointment.patient_id = data["patient_id"]

    if "doctor_id" in data:
        doctor = Doctor.query.get(data["doctor_id"])

        if not doctor:
            return jsonify({
                "error": "Doctor not found"
            }), 404

        appointment.doctor_id = data["doctor_id"]

    appointment.appointment_date = data.get(
        "appointment_date",
        appointment.appointment_date
    )

    appointment.status = data.get("status", appointment.status)

    db.session.commit()

    return jsonify({
        "message": "Appointment updated successfully",
        "appointment": {
            "id": appointment.id,
            "patient_id": appointment.patient_id,
            "patient_name": appointment.patient.full_name,
            "doctor_id": appointment.doctor_id,
            "doctor_name": appointment.doctor.full_name,
            "doctor_specialization": appointment.doctor.specialization,
            "appointment_date": appointment.appointment_date,
            "status": appointment.status
        }
    })


@app.route('/appointments/<int:id>', methods=['DELETE'])
def delete_appointment(id):

    appointment = Appointment.query.get(id)

    if not appointment:
        return jsonify({
            "error": "Appointment not found"
        }), 404
    
    db.session.delete(appointment)
    db.session.commit()

    return jsonify({
        "message": "Appointment deleted successfully"
    })


@app.route("/dashboard/stats", methods=["GET"])
def dashboard_stats():

    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_appointments = Appointment.query.count()
    total_departments = Department.query.count()

    return jsonify({
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "total_departments": total_departments
    })

## Department Route ##
@app.route('/departments', methods=['POST'])
def create_department():
    data = request.get_json()

    new_department = Department(
        name=data ['name'],
        description=data ['description']
    )

    db.session.add(new_department)
    db.session.commit()

    return jsonify({
        'message': "Department created successfully",
        "department": {
            "id": new_department.id,
            "name": new_department.name,
            "description": new_department.description
        }
    }), 201


@app.route('/departments', methods=['GET'])
def get_departments():

    departments = Department.query.all()

    result = []

    for department in departments:
        result.append({
            "id": department.id,
            "name": department.name,
            "description": department.description
        })

    return jsonify(result)

@app.route('/departments/<int:id>', methods=['PUT'])
def update_department(id):

    department = Department.query.get(id)

    if not department:
        return jsonify({
            "error": "Department not found"
        }), 404
    
    data = request.get_json()

    department.name = data.get(
        'name',
        department.name
    )

    department.description = data.get(
        'description',
        department.description
    )

    db.session.commit()

    return jsonify({
        "message": "Department updated successfully",
        "department": {
            "id": department.id,
            "name": department.name,
            "description": department.description
        }
    })


@app.route('/departments/<int:id>', methods=['DELETE'])
def delete_department(id):

    department = Department.query.get(id)

    if not department:
        return jsonify({
            "error": "Department not found"
        }), 404
    
    db.session.delete(department)
    db.session.commit()

    return jsonify({
        "message": "Department deleted successfully"
    })

    


if __name__ == "__main__":
    app.run(debug=True)