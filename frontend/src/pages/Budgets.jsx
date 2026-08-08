import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Budgets.css";

function Budgets() {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        category: "",
        limit_amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const [editingId, setEditingId] = useState(null);

    const [editData, setEditData] = useState({
        category: "",
        limit_amount: "",
        month: "",
        year: "",
    });

    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {
        fetchBudgets();
        fetchCategories();
    }, []);

    // ============================================================
    // GET BUDGETS
    // ============================================================

    const fetchBudgets = async () => {
        try {
            const response = await api.get(
                "finance/budgets/"
            );

            setBudgets(response.data);
        } catch (error) {
            console.error(
                "Error fetching budgets:",
                error.response?.data || error.message
            );
        }
    };

    // ============================================================
    // GET CATEGORIES
    // ============================================================

    const fetchCategories = async () => {
        try {
            const response = await api.get(
                "finance/categories/"
            );

            setCategories(response.data);
        } catch (error) {
            console.error(
                "Error fetching categories:",
                error.response?.data || error.message
            );
        }
    };

    // ============================================================
    // ONLY EXPENSE CATEGORIES
    // ============================================================

    const expenseCategories = categories.filter(
        (category) => category.type === "EXPENSE"
    );

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================================================
    // ADD BUDGET
    // ============================================================

    const addBudget = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            alert("Please select a category.");
            return;
        }

        if (!formData.limit_amount) {
            alert("Please enter a budget limit.");
            return;
        }

        if (Number(formData.limit_amount) <= 0) {
            alert("Budget limit must be greater than zero.");
            return;
        }

        try {
            await api.post(
                "finance/budgets/",
                {
                    category: Number(formData.category),
                    limit_amount: formData.limit_amount,
                    month: Number(formData.month),
                    year: Number(formData.year),
                }
            );

            alert("Budget added successfully.");

            setFormData({
                category: "",
                limit_amount: "",
                month: new Date().getMonth() + 1,
                year: new Date().getFullYear(),
            });

            fetchBudgets();
        } catch (error) {
            console.error(
                "Error adding budget:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.category?.[0] ||
                error.response?.data?.limit_amount?.[0] ||
                error.response?.data?.error ||
                "Failed to add budget."
            );
        }
    };

    // ============================================================
    // DELETE BUDGET
    // ============================================================

    const deleteBudget = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this budget?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `finance/budgets/${id}/`
            );

            alert("Budget deleted successfully.");

            fetchBudgets();
        } catch (error) {
            console.error(
                "Error deleting budget:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.error ||
                "Failed to delete budget."
            );
        }
    };

    // ============================================================
    // START EDIT
    // ============================================================

    const startEdit = (budget) => {
        setEditingId(budget.id);

        setEditData({
            category: String(budget.category),
            limit_amount: budget.limit_amount,
            month: budget.month,
            year: budget.year,
        });
    };

    // ============================================================
    // EDIT CHANGE
    // ============================================================

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================================================
    // UPDATE BUDGET
    // ============================================================

    const updateBudget = async (id) => {
        if (!editData.category) {
            alert("Please select a category.");
            return;
        }

        if (!editData.limit_amount) {
            alert("Please enter a budget limit.");
            return;
        }

        if (Number(editData.limit_amount) <= 0) {
            alert("Budget limit must be greater than zero.");
            return;
        }

        try {
            await api.put(
                `finance/budgets/${id}/`,
                {
                    category: Number(editData.category),
                    limit_amount: editData.limit_amount,
                    month: Number(editData.month),
                    year: Number(editData.year),
                }
            );

            alert("Budget updated successfully.");

            setEditingId(null);

            fetchBudgets();
        } catch (error) {
            console.error(
                "Error updating budget:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.category?.[0] ||
                error.response?.data?.limit_amount?.[0] ||
                error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.error ||
                "Failed to update budget."
            );
        }
    };

    // ============================================================
    // MONTH NAME
    // ============================================================

    const getMonthName = (month) => {
        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        return months[Number(month) - 1] || month;
    };

    // ============================================================
    // BUDGET STATUS
    // ============================================================

    const getBudgetStatus = (budget) => {
        const limit = Number(
            budget.limit_amount || 0
        );

        const spent = Number(
            budget.spent_amount || 0
        );

        if (limit <= 0) {
            return {
                status: "INVALID",
                message: "Invalid budget limit",
                percentage: 0,
            };
        }

        const percentage =
            (spent / limit) * 100;

        if (spent > limit) {
            return {
                status: "EXCEEDED",
                message: `Budget exceeded by ${(
                    spent - limit
                ).toFixed(2)} ETB`,
                percentage: 100,
            };
        }

        if (percentage >= 90) {
            return {
                status: "WARNING",
                message: `${percentage.toFixed(
                    0
                )}% of budget used`,
                percentage,
            };
        }

        return {
            status: "SAFE",
            message: "Within budget",
            percentage,
        };
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="budgets-page">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="budgets-header">

                <div>

                    <span className="budgets-eyebrow">
                        🎯 Financial Planning
                    </span>

                    <h1>
                        Budgets
                    </h1>

                    <p>
                        Set spending limits and keep track
                        of your financial goals.
                    </p>

                </div>

            </div>

            {/* ====================================================
                ADD BUDGET
            ==================================================== */}

            <section className="budget-form-section">

                <div className="section-heading">

                    <div className="section-icon">
                        ➕
                    </div>

                    <div>

                        <h2>
                            Create a Budget
                        </h2>

                        <p>
                            Set a spending limit for an
                            expense category.
                        </p>

                    </div>

                </div>

                <form
                    className="budget-form"
                    onSubmit={addBudget}
                >

                    {/* CATEGORY */}

                    <div className="form-group">

                        <label>
                            Expense Category
                        </label>

                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Expense Category
                            </option>

                            {expenseCategories.map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    {/* LIMIT */}

                    <div className="form-group">

                        <label>
                            Budget Limit
                        </label>

                        <input
                            type="number"
                            name="limit_amount"
                            placeholder="e.g. 5000"
                            value={formData.limit_amount}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                        />

                    </div>

                    {/* MONTH */}

                    <div className="form-group">

                        <label>
                            Month
                        </label>

                        <select
                            name="month"
                            value={formData.month}
                            onChange={handleChange}
                        >

                            {Array.from(
                                { length: 12 },
                                (_, index) => index + 1
                            ).map((month) => (

                                <option
                                    key={month}
                                    value={month}
                                >
                                    {getMonthName(month)}
                                </option>

                            ))}

                        </select>

                    </div>

                    {/* YEAR */}

                    <div className="form-group">

                        <label>
                            Year
                        </label>

                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            min="2000"
                        />

                    </div>

                    <button
                        type="submit"
                        className="add-budget-btn"
                    >
                        + Add Budget
                    </button>

                </form>

            </section>

            {/* ====================================================
                BUDGET LIST
            ==================================================== */}

            <section className="budgets-list-section">

                <div className="section-heading">

                    <div className="section-icon">
                        🎯
                    </div>

                    <div>

                        <h2>
                            My Budgets
                        </h2>

                        <p>
                            Monitor your spending against
                            your limits.
                        </p>

                    </div>

                </div>

                {budgets.length === 0 ? (

                    /* EMPTY STATE */

                    <div className="empty-budget-state">

                        <div className="empty-budget-icon">
                            🎯
                        </div>

                        <h3>
                            No budgets yet
                        </h3>

                        <p>
                            Create your first budget to
                            start managing your spending.
                        </p>

                    </div>

                ) : (

                    /* BUDGET CARDS */

                    <div className="budgets-grid">

                        {budgets.map((budget) => {

                            const budgetStatus =
                                getBudgetStatus(
                                    budget
                                );

                            const limit =
                                Number(
                                    budget.limit_amount ||
                                    0
                                );

                            const spent =
                                Number(
                                    budget.spent_amount ||
                                    0
                                );

                            const remaining =
                                Number(
                                    budget.remaining_amount ||
                                    0
                                );

                            const percentage =
                                budgetStatus.percentage;

                            return (

                                <div
                                    key={budget.id}
                                    className={`budget-card ${budgetStatus.status.toLowerCase()}`}
                                >

                                    {/* ====================
                                        CARD HEADER
                                    ==================== */}

                                    <div className="budget-card-top">

                                        <div className="budget-category">

                                            <div className="budget-category-icon">
                                                🎯
                                            </div>

                                            <div>

                                                <h3>
                                                    {
                                                        budget.category_name ||
                                                        "Unknown Category"
                                                    }
                                                </h3>

                                                <p>
                                                    {getMonthName(
                                                        budget.month
                                                    )}{" "}
                                                    {budget.year}
                                                </p>

                                            </div>

                                        </div>

                                        <span
                                            className={`budget-status-badge ${budgetStatus.status.toLowerCase()}`}
                                        >

                                            {budgetStatus.status ===
                                            "EXCEEDED"
                                                ? "🚨 Exceeded"
                                                : budgetStatus.status ===
                                                  "WARNING"
                                                ? "⚠️ Warning"
                                                : budgetStatus.status ===
                                                  "INVALID"
                                                ? "❌ Invalid"
                                                : "✅ Safe"}

                                        </span>

                                    </div>

                                    {/* ====================
                                        PROGRESS
                                    ==================== */}

                                    <div className="budget-progress-info">

                                        <span>
                                            Spending
                                        </span>

                                        <strong>
                                            {percentage.toFixed(
                                                0
                                            )}
                                            %
                                        </strong>

                                    </div>

                                    <div className="budget-progress-track">

                                        <div
                                            className={`budget-progress-fill ${budgetStatus.status.toLowerCase()}`}
                                            style={{
                                                width: `${Math.min(
                                                    percentage,
                                                    100
                                                )}%`,
                                            }}
                                        />

                                    </div>

                                    {/* ====================
                                        AMOUNTS
                                    ==================== */}

                                    <div className="budget-numbers">

                                        <div>

                                            <span>
                                                Spent
                                            </span>

                                            <strong>
                                                {spent.toFixed(
                                                    2
                                                )}{" "}
                                                ETB
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Limit
                                            </span>

                                            <strong>
                                                {limit.toFixed(
                                                    2
                                                )}{" "}
                                                ETB
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Remaining
                                            </span>

                                            <strong
                                                className={
                                                    remaining <
                                                    0
                                                        ? "negative"
                                                        : ""
                                                }
                                            >
                                                {remaining.toFixed(
                                                    2
                                                )}{" "}
                                                ETB
                                            </strong>

                                        </div>

                                    </div>

                                    {/* ====================
                                        MESSAGE
                                    ==================== */}

                                    <div className="budget-message">
                                        {budgetStatus.message}
                                    </div>

                                    {/* ====================
                                        ACTIONS
                                    ==================== */}

                                    <div className="budget-actions">

                                        <button
                                            type="button"
                                            className="edit-budget-btn"
                                            onClick={() =>
                                                startEdit(
                                                    budget
                                                )
                                            }
                                        >
                                            ✏️ Edit
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-budget-btn"
                                            onClick={() =>
                                                deleteBudget(
                                                    budget.id
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </button>

                                    </div>

                                    {/* ====================
                                        EDIT FORM
                                    ==================== */}

                                    {editingId ===
                                        budget.id && (

                                        <div className="edit-budget-form">

                                            <h3>
                                                Edit Budget
                                            </h3>

                                            {/* CATEGORY */}

                                            <div className="form-group">

                                                <label>
                                                    Category
                                                </label>

                                                <select
                                                    name="category"
                                                    value={
                                                        editData.category
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                >

                                                    <option value="">
                                                        Select Category
                                                    </option>

                                                    {expenseCategories.map(
                                                        (
                                                            category
                                                        ) => (

                                                            <option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >
                                                                {
                                                                    category.name
                                                                }
                                                            </option>

                                                        )
                                                    )}

                                                </select>

                                            </div>

                                            {/* LIMIT */}

                                            <div className="form-group">

                                                <label>
                                                    Budget Limit
                                                </label>

                                                <input
                                                    type="number"
                                                    name="limit_amount"
                                                    value={
                                                        editData.limit_amount
                                                    }
                                                    onChange={
                                                        handleEditChange
                                                    }
                                                    min="0"
                                                    step="0.01"
                                                />

                                            </div>

                                            {/* MONTH + YEAR */}

                                            <div className="edit-row">

                                                <div className="form-group">

                                                    <label>
                                                        Month
                                                    </label>

                                                    <select
                                                        name="month"
                                                        value={
                                                            editData.month
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                    >

                                                        {Array.from(
                                                            {
                                                                length: 12,
                                                            },
                                                            (
                                                                _,
                                                                index
                                                            ) =>
                                                                index +
                                                                1
                                                        ).map(
                                                            (
                                                                month
                                                            ) => (

                                                                <option
                                                                    key={
                                                                        month
                                                                    }
                                                                    value={
                                                                        month
                                                                    }
                                                                >
                                                                    {getMonthName(
                                                                        month
                                                                    )}
                                                                </option>

                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                <div className="form-group">

                                                    <label>
                                                        Year
                                                    </label>

                                                    <input
                                                        type="number"
                                                        name="year"
                                                        value={
                                                            editData.year
                                                        }
                                                        onChange={
                                                            handleEditChange
                                                        }
                                                        min="2000"
                                                    />

                                                </div>

                                            </div>

                                            {/* EDIT ACTIONS */}

                                            <div className="edit-actions">

                                                <button
                                                    type="button"
                                                    className="save-budget-btn"
                                                    onClick={() =>
                                                        updateBudget(
                                                            budget.id
                                                        )
                                                    }
                                                >
                                                    ✓ Save Changes
                                                </button>

                                                <button
                                                    type="button"
                                                    className="cancel-budget-btn"
                                                    onClick={() =>
                                                        setEditingId(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>
                            );
                        })}

                    </div>
                )}

            </section>

        </div>
    );
}

export default Budgets;
