import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Common/Card';
import Button from '../Common/Button';

const Home = () => {
  return (
    <div className="home-container">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="welcome-card text-center">
            <div className="card-body">
              <h1 className="card-title display-4 mb-4">
                Welcome to Risk Management
              </h1>
              <p className="card-text lead mb-4">
                Manage document verification and risk assessment with our secure and user-friendly platform.
              </p>
              <div className="d-grid gap-3">
                <Link to="/login">
                  <Button variant="primary" size="lg" className="w-100">
                    User Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline-primary" size="lg" className="w-100">
                    User Registration
                  </Button>
                </Link>
                <Link to="/admin-login">
                  <Button variant="secondary" size="lg" className="w-100">
                    Admin Login
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
