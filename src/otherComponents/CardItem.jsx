import React from 'react';
import { Link } from 'react-router-dom';

const CardItem = ({ path, icon, img, title, text, subtext, footerNote, color }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <Link to={path} className="text-decoration-none text-dark">
        <div className="card h-80 shadow-sm">
          <div className="card-body">
            <div className="mb-3">
              {icon ? (
                <i className={icon} style={{ fontSize: '20px', color }}></i>
              ) : (
                <img
                  src={img}
                  alt={`${title} Logo`}
                  className="img-fluid"
                  style={{ maxHeight: '40px' }}
                />
              )
              }
            </div>

            <h3 className="card-title">{title}</h3>
            <p className="card-text small-text">
              {text}
              <br />
              {subtext}
            </p>
          </div>
          <div className="card-footer bg-light">
            <small className="text-muted">{footerNote}</small>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CardItem;
