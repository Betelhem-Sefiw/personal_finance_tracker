import { useEffect, useState } from "react";
import api from "../api/axios";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import "./Dashboard.css";

function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {
        fetchDashboard();
        fetchProfile();
    }, []);

    // ============================================================
    // FETCH DASHBOARD
    // ============================================================

    const fetchDashboard = async () => {
        try {
            const response = await api.get(
                "finance/dashboard/"
            );

            console.log(
                "DASHBOARD RESPONSE:",
                response.data
            );

            setDashboard(response.data);
        } catch (error) {
            console.error(
                "Dashboard error:",
                error.response?.data ||
                    error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH PROFILE
    // ============================================================

    const fetchProfile = async () => {
        try {
            const response = await api.get(
                "accounts/profile/"
            );

            setUser(response.data);
        } catch (error) {
            console.error(
                "Profile error:",
                error.response?.data ||
                    error.message
            );
        }
    };

    // ============================================================
    // CATEGORY EMOJI
    // ============================================================

    const getCategoryEmoji = (name) => {
        if (!name) {
            return "🏷️";
        }

        const category =
            String(name).toLowerCase();

        if (
            category.includes("food") ||
            category.includes("restaurant") ||
            category.includes("meal")
        ) {
            return "🍔";
        }

        if (
            category.includes("electric") ||
            category.includes("power") ||
            category.includes("utility")
        ) {
            return "💡";
        }

        if (
            category.includes("transport") ||
            category.includes("taxi") ||
            category.includes("fuel") ||
            category.includes("car")
        ) {
            return "🚗";
        }

        if (
            category.includes("house") ||
            category.includes("rent") ||
            category.includes("home")
        ) {
            return "🏠";
        }

        if (
            category.includes("shopping") ||
            category.includes("clothes")
        ) {
            return "🛍️";
        }

        if (
            category.includes("health") ||
            category.includes("medical")
        ) {
            return "🏥";
        }

        if (
            category.includes("education") ||
            category.includes("school")
        ) {
            return "📚";
        }

        if (
            category.includes("entertainment") ||
            category.includes("movie")
        ) {
            return "🎬";
        }

        if (
            category.includes("salary") ||
            category.includes("income")
        ) {
            return "💰";
        }

        return "🏷️";
    };

    // ============================================================
    // CATEGORY NAME
    // ============================================================

    const getCategoryName = (item) => {
        if (!item) {
            return "Uncategorized";
        }

        if (item.category__name) {
            return item.category__name;
        }

        if (item.category_name) {
            return item.category_name;
        }

        if (
            typeof item.category === "object" &&
            item.category !== null
        ) {
            return (
                item.category.name ||
                item.category.title ||
                "Uncategorized"
            );
        }

        if (item.category) {
            return String(item.category);
        }

        return "Uncategorized";
    };

    // ============================================================
    // EXPENSE CHART DATA
    // ============================================================

    const expenseChartData =
        Array.isArray(
            dashboard?.expense_categories
        )
            ? dashboard.expense_categories
                  .map((item) => ({
                      name:
                          getCategoryName(item),

                      amount: Number(
                          item.total ??
                              item.amount ??
                              0
                      ),
                  }))
                  .filter(
                      (item) =>
                          item.amount > 0
                  )
            : [];

    // ============================================================
    // INCOME VS EXPENSE DATA
    // ============================================================

    const incomeExpenseData = [
        {
            name: "Finance",

            Income: Number(
                dashboard?.total_income || 0
            ),

            Expenses: Number(
                dashboard?.total_expense || 0
            ),
        },
    ];

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-emoji">
                    ⏳
                </div>

                <p>
                    Loading your financial
                    dashboard...
                </p>
            </div>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (!dashboard) {
        return (
            <div className="dashboard-error">
                <div>⚠️</div>

                <p>
                    Unable to load dashboard.
                </p>

                <button
                    onClick={fetchDashboard}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ============================================================
    // DASHBOARD
    // ============================================================

    return (
        <div className="dashboard">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="dashboard-header">

                <div>

                    <div className="welcome-label">
                        👋 Welcome back,{" "}
                        {user?.username ||
                            "User"}!
                    </div>

                    <h1>
                        Financial Dashboard
                    </h1>

                    <p>
                        Here's an overview of
                        your financial health.
                    </p>

                </div>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="summary-grid">

                {/* TOTAL INCOME */}

                <div className="summary-card income-card">

                    <div className="summary-icon">
                        💰
                    </div>

                    <div>

                        <p>
                            Total Income
                        </p>

                        <h2>
                            {Number(
                                dashboard.total_income ||
                                    0
                            ).toFixed(2)}{" "}
                            ETB
                        </h2>

                    </div>

                </div>


                {/* TOTAL EXPENSE */}

                <div className="summary-card expense-card">

                    <div className="summary-icon">
                        💸
                    </div>

                    <div>

                        <p>
                            Total Expenses
                        </p>

                        <h2>
                            {Number(
                                dashboard.total_expense ||
                                    0
                            ).toFixed(2)}{" "}
                            ETB
                        </h2>

                    </div>

                </div>


                {/* CURRENT BALANCE */}

                <div className="summary-card balance-card">

                    <div className="summary-icon">
                        💳
                    </div>

                    <div>

                        <p>
                            Current Balance
                        </p>

                        <h2>
                            {Number(
                                dashboard.current_balance ||
                                    0
                            ).toFixed(2)}{" "}
                            ETB
                        </h2>

                    </div>

                </div>


                {/* TRANSACTIONS */}

                <div className="summary-card transaction-card">

                    <div className="summary-icon">
                        🧾
                    </div>

                    <div>

                        <p>
                            Transactions
                        </p>

                        <h2>
                            {dashboard.total_transactions ||
                                0}
                        </h2>

                    </div>

                </div>

            </div>


            {/* ==================================================
                CHARTS
            ================================================== */}

            <div className="charts-grid">

                {/* ==================================================
                    INCOME VS EXPENSE
                ================================================== */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div className="section-title">

                            <span>
                                📊
                            </span>

                            <div>

                                <h2>
                                    Income vs
                                    Expenses
                                </h2>

                                <p>
                                    Compare your
                                    income and
                                    spending
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="chart-container">

                        <ResponsiveContainer
                            width="100%"
                            height={320}
                        >

                            <BarChart
                                data={
                                    incomeExpenseData
                                }
                            >

                                <CartesianGrid
                                    strokeDasharray="3 3"
                                />

                                <XAxis
                                    dataKey="name"
                                />

                                <YAxis />

                                <Tooltip />

                                <Legend />

                                <Bar
                                    dataKey="Income"
                                    fill="#16a34a"
                                    radius={[
                                        8,
                                        8,
                                        0,
                                        0,
                                    ]}
                                />

                                <Bar
                                    dataKey="Expenses"
                                    fill="#ef4444"
                                    radius={[
                                        8,
                                        8,
                                        0,
                                        0,
                                    ]}
                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* ==================================================
                    EXPENSE CATEGORY PIE CHART
                ================================================== */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div className="section-title">

                            <span>
                                🍩
                            </span>

                            <div>

                                <h2>
                                    Expenses by
                                    Category
                                </h2>

                                <p>
                                    Where your
                                    money is
                                    going
                                </p>

                            </div>

                        </div>

                    </div>


                    {expenseChartData.length ===
                    0 ? (

                        <div className="empty-state">

                            <div>
                                🪙
                            </div>

                            <p>
                                No expenses
                                recorded yet.
                            </p>

                        </div>

                    ) : (

                        <div className="chart-container">

                            <ResponsiveContainer
                                width="100%"
                                height={320}
                            >

                                <PieChart>

                                    <Pie
                                        data={
                                            expenseChartData
                                        }
                                        dataKey="amount"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={
                                            110
                                        }
                                        label
                                    >

                                        {expenseChartData.map(
                                            (
                                                _,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        index
                                                    }
                                                    fill={
                                                        [
                                                            "#2563eb",
                                                            "#16a34a",
                                                            "#ef4444",
                                                            "#9333ea",
                                                            "#f97316",
                                                            "#0891b2",
                                                        ][
                                                            index %
                                                                6
                                                        ]
                                                    }
                                                />

                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>

                    )}

                </div>

            </div>


            {/* ==================================================
                EXPENSE DETAILS
            ================================================== */}

            <div className="dashboard-panel">

                <div className="panel-header">

                    <div className="section-title">

                        <span>
                            💸
                        </span>

                        <div>

                            <h2>
                                Expense Details
                            </h2>

                            <p>
                                Total spending by
                                category
                            </p>

                        </div>

                    </div>

                </div>


                {expenseChartData.length ===
                0 ? (

                    <div className="empty-state">

                        <div>
                            📭
                        </div>

                        <p>
                            No expense categories
                            yet.
                        </p>

                    </div>

                ) : (

                    <div className="expense-list">

                        {expenseChartData.map(
                            (
                                category,
                                index
                            ) => (

                                <div
                                    className="expense-item"
                                    key={`${category.name}-${index}`}
                                >

                                    <div className="expense-info">

                                        <div className="category-icon">
                                            {getCategoryEmoji(
                                                category.name
                                            )}
                                        </div>

                                        <div>

                                            <strong>
                                                {
                                                    category.name
                                                }
                                            </strong>

                                            <p>
                                                Expense
                                                category
                                            </p>

                                        </div>

                                    </div>


                                    <strong>
                                        {category.amount.toFixed(
                                            2
                                        )}{" "}
                                        ETB
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* ==================================================
                RECENT TRANSACTIONS
            ================================================== */}

            <div className="dashboard-panel">

                <div className="panel-header">

                    <div className="section-title">

                        <span>
                            🧾
                        </span>

                        <div>

                            <h2>
                                Recent
                                Transactions
                            </h2>

                            <p>
                                Your latest
                                financial
                                activity
                            </p>

                        </div>

                    </div>

                </div>


                {Array.isArray(
                    dashboard.recent_transactions
                ) &&
                dashboard.recent_transactions
                    .length > 0 ? (

                    <div className="recent-transactions-list">

                        {dashboard.recent_transactions.map(
                            (
                                transaction
                            ) => {

                                const isIncome =
                                    String(
                                        transaction.transaction_type ||
                                            ""
                                    ).toUpperCase() ===
                                    "INCOME";

                                let category =
                                    transaction.category_name ||
                                    transaction.category ||
                                    "Uncategorized";

                                if (
                                    typeof category ===
                                        "object" &&
                                    category !== null
                                ) {
                                    category =
                                        category.name ||
                                        "Uncategorized";
                                }

                                return (

                                    <div
                                        className="recent-transaction"
                                        key={
                                            transaction.id
                                        }
                                    >

                                        <div
                                            className={`transaction-icon ${
                                                isIncome
                                                    ? "income-icon"
                                                    : "expense-icon"
                                            }`}
                                        >
                                            {isIncome
                                                ? "💰"
                                                : "💸"}
                                        </div>


                                        <div className="transaction-info">

                                            <strong>
                                                {
                                                    category
                                                }
                                            </strong>

                                            <p>
                                                {transaction.description ||
                                                    "No description"}
                                            </p>

                                            <small>
                                                📅{" "}
                                                {transaction.transaction_date ||
                                                    "No date"}
                                            </small>

                                        </div>


                                        <strong
                                            className={
                                                isIncome
                                                    ? "income-amount"
                                                    : "expense-amount"
                                            }
                                        >

                                            {isIncome
                                                ? "+"
                                                : "-"}

                                            {Number(
                                                transaction.amount ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}{" "}
                                            ETB

                                        </strong>

                                    </div>

                                );
                            }
                        )}

                    </div>

                ) : (

                    <div className="empty-state">

                        <div>
                            🧾
                        </div>

                        <p>
                            No transactions
                            recorded yet.
                        </p>

                    </div>

                )}

            </div>

        </div>
    );
}

export default Dashboard;
