import { Link } from "react-router-dom";


function Sidebar() {

    return (

        <aside>

            <h3>
                Menu
            </h3>


            <Link to="/dashboard">
                Dashboard
            </Link>


            <Link to="/transactions">
                Transactions
            </Link>


            <Link to="/budgets">
                Budgets
            </Link>


            <Link to="/categories">
                Categories
            </Link>


            <Link to="/notifications">
                Notifications
            </Link>


        </aside>

    );
}


export default Sidebar;