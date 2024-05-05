import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { UserProvider } from '~/store/UserContext';
import { LoadingProvider } from '~/store/LoadingContext';
import DefaultLayout from '~/layout/DefaultLayout';
import Login from '~/pages/Common/Login';
import Signup from '~/pages/Common/Signup';
import Profile from '~/pages/Common/Profile';
import Problems from '~/pages/User/Problems';
import Course from '~/pages/User/Course';
import Competition from '~/pages/User/Competition';
import ProblemsDetail from '~/pages/User/ProblemDetail';
import LecturerDashboard from '~/pages/Lecturer/Dashboard';
import LecturerProblem from '~/pages/Lecturer/Problem';
import LecturerCourse from '~/pages/Lecturer/Course';
import AdminDashboardUser from '~/pages/Admin/User';
import AdminDashboardProblem from '~/pages/Admin/Problems';
import AdminDashboardSubmission from '~/pages/Admin/Submissions';
import AdminDashboardClass from '~/pages/Admin/Classes';

function App() {
  return (
    <Router>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <LoadingProvider>
          <UserProvider>
            <DefaultLayout>
              <Routes>
                <Route path="auth">
                  <Route
                    index
                    element={<Navigate to="/auth/login" replace={true} />}
                  />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                </Route>
                <Route path="problems">
                  <Route index element={<Problems />} />
                  <Route path=":slug" element={<ProblemsDetail />} />
                </Route>
                <Route path="lecturer">
                  <Route
                    index
                    element={
                      <Navigate to="/lecturer/dashboard" replace={true} />
                    }
                  />
                  <Route path="dashboard" element={<LecturerDashboard />} />
                  <Route path="problems/:slug" element={<LecturerProblem />} />
                  <Route path="problems/__new" element={<LecturerProblem />} />
                  <Route path="courses" element={<LecturerCourse />} />
                </Route>
                <Route path="profile/:id" element={<Profile />} />
                <Route path="admin">
                  <Route
                    index
                    element={<Navigate to="/admin/users" replace={true} />}
                  />
                  <Route path="users" element={<AdminDashboardUser />} />
                  <Route path="problems" element={<AdminDashboardProblem />} />
                  <Route
                    path="submissions"
                    element={<AdminDashboardSubmission />}
                  />
                  <Route path="classes" element={<AdminDashboardClass />} />
                </Route>
                <Route path="competition" element={<Competition />} />
                <Route path="courses" element={<Course />} />
                <Route path="*" element={<Navigate to="/auth" />} />
              </Routes>
            </DefaultLayout>
          </UserProvider>
        </LoadingProvider>
      </LocalizationProvider>
    </Router>
  );
}

export default App;
