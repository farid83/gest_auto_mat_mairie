import UsersTable from '../components/Users/UsersTable';

const UsersManagement = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
    <div className="max-w-4xl mx-auto">
      <UsersTable />
    </div>
  </div>
);

export default UsersManagement;