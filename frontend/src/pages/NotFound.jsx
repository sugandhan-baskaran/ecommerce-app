import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="max-w-lg mx-auto px-4 py-24 text-center">
    <h1 className="text-5xl font-bold text-primary-600 mb-4">404</h1>
    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
    <Link to="/" className="btn-primary">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
