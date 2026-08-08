import { Link } from "react-router-dom";


function Navbar(){

    return (

        <nav>

            <Link to="/dashboard">
                Dashboard
            </Link>


            <Link to="/transactions">
                Transactions
            </Link>


            <Link to="/categories">
                Categories
            </Link>
            <Link to="/notifications">
                Notifications
            </Link>

        </nav>

    );

}


export default Navbar;