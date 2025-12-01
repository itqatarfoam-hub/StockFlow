// Minimal test version
window.hrmEmployeesModule = {
    render() {
        return '<div><h2>Employees Module Test</h2><div id="employeesGrid">Loading...</div></div>';
    },
    async attachListeners() {
        const response = await fetch('/api/hrm/employees');
        const data = await response.json();
        const container = document.getElementById('employeesGrid');
        if (container && data.success) {
            container.innerHTML = data.employees.length === 0
                ? 'No employees found'
                : `Found ${data.employees.length} employees`;
        }
    }
};
console.log('✅ Test employees module loaded');
