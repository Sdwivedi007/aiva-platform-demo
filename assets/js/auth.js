class Auth {
    static checkAuth() {
        if (localStorage.getItem('isAuthenticated') !== 'true') {
            window.location.href = 'login.html';
        }
    }

    static logout() {
        localStorage.removeItem('isAuthenticated');
        window.location.href = 'login.html';
    }
}