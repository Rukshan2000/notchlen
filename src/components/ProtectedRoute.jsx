import { Navigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {


    const savedAuth = localStorage.getItem('authUser');
    if (!savedAuth) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute; 