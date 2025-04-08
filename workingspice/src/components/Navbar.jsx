export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <a href="/">Workingspice</a>
            </div>
            <div className="navbar-links">
                <a href="/dashboard">Dashboard</a>
                <a href="/profile">Profile</a>
                <a href="/login">Login</a>
                <a href="/register">Register</a>
            </div>
        </nav>
    );
}