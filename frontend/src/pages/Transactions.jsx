import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Transactions.css";

function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        category: "",
        amount: "",
        transaction_type: "EXPENSE",
        description: "",
        transaction_date: "",
    };

    const [formData, setFormData] = useState(emptyForm);
    const [editData, setEditData] = useState(emptyForm);

    // ============================================================
    // LOAD DATA
    // ============================================================

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);

        try {
            await Promise.all([
                fetchTransactions(),
                fetchCategories(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FETCH TRANSACTIONS
    // ============================================================

    const fetchTransactions = async () => {
        try {
            const response = await api.get(
                "finance/transactions/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            console.log(
                "TRANSACTIONS RESPONSE:",
                data
            );

            setTransactions(data);
        } catch (error) {
            console.error(
                "Error fetching transactions:",
                error.response?.data || error.message
            );

            setTransactions([]);
        }
    };

    // ============================================================
    // FETCH CATEGORIES
    // ============================================================

    const fetchCategories = async () => {
        try {
            const response = await api.get(
                "finance/categories/"
            );

            const data = Array.isArray(response.data)
                ? response.data
                : response.data?.results || [];

            console.log(
                "CATEGORIES RESPONSE:",
                data
            );

            console.log(
                "CATEGORY TYPES:",
                data.map((category) => ({
                    id: category.id,
                    name: category.name,
                    type: category.type,
                    category_type:
                        category.category_type,
                }))
            );

            setCategories(data);
        } catch (error) {
            console.error(
                "Error fetching categories:",
                error.response?.data || error.message
            );

            setCategories([]);
        }
    };

    // ============================================================
    // GET CATEGORY TYPE
    // ============================================================

    const getCategoryType = (category) => {
        if (!category) {
            return "";
        }

        const type =
            category.type ||
            category.category_type ||
            category.transaction_type ||
            "";

        return String(type)
            .trim()
            .toUpperCase();
    };

    // ============================================================
    // GET CATEGORY NAME
    // ============================================================

    const getCategoryName = (category) => {
        if (!category) {
            return "Uncategorized";
        }

        if (typeof category === "object") {
            return (
                category.name ||
                category.title ||
                "Uncategorized"
            );
        }

        return String(category);
    };

    // ============================================================
    // GET CATEGORY ID
    // ============================================================

    const getCategoryId = (transaction) => {
        if (!transaction) {
            return "";
        }

        if (
            typeof transaction.category === "object" &&
            transaction.category !== null
        ) {
            return String(
                transaction.category.id || ""
            );
        }

        return String(
            transaction.category || ""
        );
    };

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
    // EDIT FORM CHANGE
    // ============================================================

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // ============================================================
    // FILTER CATEGORIES
    // ============================================================

    const filteredCategories = categories.filter(
        (category) => {
            const categoryType =
                getCategoryType(category);

            return (
                categoryType ===
                formData.transaction_type
            );
        }
    );

    const filteredEditCategories =
        categories.filter(
            (category) => {
                const categoryType =
                    getCategoryType(category);

                return (
                    categoryType ===
                    editData.transaction_type
                );
            }
        );

    // ============================================================
    // ADD TRANSACTION
    // ============================================================

    const addTransaction = async (e) => {
        e.preventDefault();

        if (!formData.category) {
            alert("Please select a category.");
            return;
        }

        if (
            !formData.amount ||
            Number(formData.amount) <= 0
        ) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!formData.transaction_date) {
            alert(
                "Please select a transaction date."
            );
            return;
        }

        setSaving(true);

        try {
            const payload = {
                category: Number(
                    formData.category
                ),
                amount: formData.amount,
                transaction_type:
                    formData.transaction_type,
                description:
                    formData.description,
                transaction_date:
                    formData.transaction_date,
            };

            console.log(
                "ADDING TRANSACTION:",
                payload
            );

            await api.post(
                "finance/transactions/",
                payload
            );

            alert(
                "Transaction added successfully! 🎉"
            );

            setFormData({
                ...emptyForm,
            });

            await fetchTransactions();
        } catch (error) {
            console.error(
                "Error adding transaction:",
                error.response?.data ||
                    error.message
            );

            const data =
                error.response?.data || {};

            alert(
                data?.transaction_type?.[0] ||
                    data?.category?.[0] ||
                    data?.amount?.[0] ||
                    data?.transaction_date?.[0] ||
                    data?.description?.[0] ||
                    data?.error ||
                    data?.detail ||
                    "Failed to add transaction."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DELETE TRANSACTION
    // ============================================================

    const deleteTransaction = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(
                `finance/transactions/${id}/`
            );

            alert(
                "Transaction deleted successfully. 🗑️"
            );

            await fetchTransactions();
        } catch (error) {
            console.error(
                "Error deleting transaction:",
                error.response?.data ||
                    error.message
            );

            alert(
                error.response?.data?.detail ||
                    error.response?.data?.error ||
                    "Failed to delete transaction."
            );
        }
    };

    // ============================================================
    // START EDITING
    // ============================================================

    const startEditing = (transaction) => {
        const transactionType =
            String(
                transaction.transaction_type ||
                    "EXPENSE"
            ).toUpperCase();

        setEditingId(transaction.id);

        setEditData({
            category:
                getCategoryId(transaction),

            amount:
                transaction.amount || "",

            transaction_type:
                transactionType,

            description:
                transaction.description || "",

            transaction_date:
                transaction.transaction_date || "",
        });
    };

    // ============================================================
    // UPDATE TRANSACTION
    // ============================================================

    const updateTransaction = async (id) => {
        if (!editData.category) {
            alert("Please select a category.");
            return;
        }

        if (
            !editData.amount ||
            Number(editData.amount) <= 0
        ) {
            alert("Please enter a valid amount.");
            return;
        }

        if (!editData.transaction_date) {
            alert(
                "Please select a transaction date."
            );
            return;
        }

        setSaving(true);

        try {
            const payload = {
                category: Number(
                    editData.category
                ),
                amount: editData.amount,
                transaction_type:
                    editData.transaction_type,
                description:
                    editData.description,
                transaction_date:
                    editData.transaction_date,
            };

            console.log(
                "UPDATING TRANSACTION:",
                payload
            );

            await api.put(
                `finance/transactions/${id}/`,
                payload
            );

            alert(
                "Transaction updated successfully! ✨"
            );

            setEditingId(null);
            setEditData({
                ...emptyForm,
            });

            await fetchTransactions();
        } catch (error) {
            console.error(
                "Error updating transaction:",
                error.response?.data ||
                    error.message
            );

            const data =
                error.response?.data || {};

            alert(
                data?.transaction_type?.[0] ||
                    data?.category?.[0] ||
                    data?.amount?.[0] ||
                    data?.transaction_date?.[0] ||
                    data?.description?.[0] ||
                    data?.error ||
                    data?.detail ||
                    "Failed to update transaction."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // CANCEL EDIT
    // ============================================================

    const cancelEdit = () => {
        setEditingId(null);

        setEditData({
            ...emptyForm,
        });
    };

    // ============================================================
    // FORMAT AMOUNT
    // ============================================================

    const formatAmount = (amount) => {
        return Number(amount || 0).toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="transactions-loading">

                <div className="loading-icon">
                    ⏳
                </div>

                <h2>
                    Loading transactions...
                </h2>

                <p>
                    Please wait while we load your
                    financial activity.
                </p>

            </div>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="transactions-container">

            {/* HEADER */}

            <div className="transactions-header">

                <div>

                    <span className="page-label">
                        💰 Financial Activity
                    </span>

                    <h1>
                        Transactions
                    </h1>

                    <p>
                        Add, manage and track your
                        income and expenses.
                    </p>

                </div>

                <div className="transaction-count">
                    🧾 {transactions.length}{" "}
                    transactions
                </div>

            </div>


            {/* ADD TRANSACTION */}

            <div className="transaction-form-card">

                <div className="form-card-header">

                    <div className="form-icon">
                        ➕
                    </div>

                    <div>

                        <h2>
                            Add Transaction
                        </h2>

                        <p>
                            Record a new income or
                            expense.
                        </p>

                    </div>

                </div>


                <form
                    className="transaction-form"
                    onSubmit={addTransaction}
                >

                    {/* TYPE */}

                    <div className="form-group">

                        <label>
                            Transaction Type
                        </label>

                        <select
                            name="transaction_type"
                            value={
                                formData.transaction_type
                            }
                            onChange={handleChange}
                        >

                            <option value="EXPENSE">
                                💸 Expense
                            </option>

                            <option value="INCOME">
                                💰 Income
                            </option>

                        </select>

                    </div>


                    {/* CATEGORY */}

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <select
                            name="category"
                            value={
                                formData.category
                            }
                            onChange={handleChange}
                        >

                            <option value="">
                                Select category
                            </option>

                            {filteredCategories.map(
                                (category) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {getCategoryName(
                                            category
                                        )}
                                    </option>
                                )
                            )}

                        </select>

                        {filteredCategories.length ===
                            0 && (
                            <small>
                                No{" "}
                                {formData.transaction_type.toLowerCase()}{" "}
                                categories available.
                            </small>
                        )}

                    </div>


                    {/* AMOUNT */}

                    <div className="form-group">

                        <label>
                            Amount
                        </label>

                        <div className="input-with-symbol">

                            <span>
                                ETB
                            </span>

                            <input
                                type="number"
                                name="amount"
                                placeholder="0.00"
                                value={
                                    formData.amount
                                }
                                onChange={
                                    handleChange
                                }
                                min="0"
                                step="0.01"
                            />

                        </div>

                    </div>


                    {/* DATE */}

                    <div className="form-group">

                        <label>
                            Date
                        </label>

                        <input
                            type="date"
                            name="transaction_date"
                            value={
                                formData.transaction_date
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-group full-width">

                        <label>
                            Description
                        </label>

                        <input
                            type="text"
                            name="description"
                            placeholder="What was this transaction for?"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>


                    {/* SUBMIT */}

                    <div className="form-submit">

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "➕ Add Transaction"}
                        </button>

                    </div>

                </form>

            </div>


            {/* TRANSACTION LIST */}

            <div className="transactions-list-card">

                <div className="list-header">

                    <div>

                        <span className="section-label">
                            📋 Your Activity
                        </span>

                        <h2>
                            All Transactions
                        </h2>

                        <p>
                            View and manage your
                            financial records.
                        </p>

                    </div>

                </div>


                {transactions.length === 0 ? (

                    <div className="transactions-empty">

                        <div className="empty-icon">
                            🧾
                        </div>

                        <h3>
                            No transactions yet
                        </h3>

                        <p>
                            Add your first income or
                            expense above.
                        </p>

                    </div>

                ) : (

                    <div className="transactions-list">

                        {transactions.map(
                            (transaction) => {

                                const isIncome =
                                    String(
                                        transaction.transaction_type ||
                                            ""
                                    ).toUpperCase() ===
                                    "INCOME";

                                const categoryName =
                                    transaction.category_name ||
                                    getCategoryName(
                                        transaction.category
                                    );

                                return (
                                    <div
                                        className={`transaction-item ${
                                            isIncome
                                                ? "income"
                                                : "expense"
                                        }`}
                                        key={
                                            transaction.id
                                        }
                                    >

                                        {editingId !==
                                            transaction.id && (
                                            <>

                                                <div
                                                    className={`transaction-main-icon ${
                                                        isIncome
                                                            ? "income-bg"
                                                            : "expense-bg"
                                                    }`}
                                                >
                                                    {isIncome
                                                        ? "💰"
                                                        : "💸"}
                                                </div>


                                                <div className="transaction-details">

                                                    <div className="transaction-title-row">

                                                        <h3>
                                                            {
                                                                categoryName
                                                            }
                                                        </h3>

                                                        <span
                                                            className={`type-badge ${
                                                                isIncome
                                                                    ? "income-badge"
                                                                    : "expense-badge"
                                                            }`}
                                                        >
                                                            {isIncome
                                                                ? "Income"
                                                                : "Expense"}
                                                        </span>

                                                    </div>


                                                    <p className="transaction-description">

                                                        {transaction.description ||
                                                            "No description"}

                                                    </p>


                                                    <div className="transaction-meta">

                                                        <span>
                                                            📅{" "}
                                                            {
                                                                transaction.transaction_date
                                                            }
                                                        </span>

                                                        <span>
                                                            🏷️{" "}
                                                            {
                                                                categoryName
                                                            }
                                                        </span>

                                                    </div>

                                                </div>


                                                <div className="transaction-right">

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
                                                        {formatAmount(
                                                            transaction.amount
                                                        )}{" "}
                                                        ETB
                                                    </strong>


                                                    <div className="transaction-actions">

                                                        <button
                                                            type="button"
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                startEditing(
                                                                    transaction
                                                                )
                                                            }
                                                        >
                                                            ✏️ Edit
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                deleteTransaction(
                                                                    transaction.id
                                                                )
                                                            }
                                                        >
                                                            🗑️ Delete
                                                        </button>

                                                    </div>

                                                </div>

                                            </>
                                        )}


                                        {/* EDIT FORM */}

                                        {editingId ===
                                            transaction.id && (

                                            <div className="edit-form">

                                                <div className="edit-form-header">

                                                    <div>
                                                        ✏️
                                                    </div>

                                                    <div>

                                                        <h3>
                                                            Edit Transaction
                                                        </h3>

                                                        <p>
                                                            Update your transaction details.
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="edit-grid">

                                                    {/* TYPE */}

                                                    <div className="form-group">

                                                        <label>
                                                            Transaction Type
                                                        </label>

                                                        <select
                                                            name="transaction_type"
                                                            value={
                                                                editData.transaction_type
                                                            }
                                                            onChange={
                                                                handleEditChange
                                                            }
                                                        >

                                                            <option value="EXPENSE">
                                                                💸 Expense
                                                            </option>

                                                            <option value="INCOME">
                                                                💰 Income
                                                            </option>

                                                        </select>

                                                    </div>


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
                                                                Select category
                                                            </option>

                                                            {filteredEditCategories.map(
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
                                                                            getCategoryName(
                                                                                category
                                                                            )
                                                                        }
                                                                    </option>
                                                                )
                                                            )}

                                                        </select>

                                                    </div>


                                                    {/* AMOUNT */}

                                                    <div className="form-group">

                                                        <label>
                                                            Amount
                                                        </label>

                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            value={
                                                                editData.amount
                                                            }
                                                            onChange={
                                                                handleEditChange
                                                            }
                                                            min="0"
                                                            step="0.01"
                                                        />

                                                    </div>


                                                    {/* DATE */}

                                                    <div className="form-group">

                                                        <label>
                                                            Date
                                                        </label>

                                                        <input
                                                            type="date"
                                                            name="transaction_date"
                                                            value={
                                                                editData.transaction_date
                                                            }
                                                            onChange={
                                                                handleEditChange
                                                            }
                                                        />

                                                    </div>


                                                    {/* DESCRIPTION */}

                                                    <div className="form-group full-width">

                                                        <label>
                                                            Description
                                                        </label>

                                                        <input
                                                            type="text"
                                                            name="description"
                                                            value={
                                                                editData.description
                                                            }
                                                            onChange={
                                                                handleEditChange
                                                            }
                                                        />

                                                    </div>

                                                </div>


                                                <div className="edit-actions">

                                                    <button
                                                        type="button"
                                                        className="save-btn"
                                                        disabled={
                                                            saving
                                                        }
                                                        onClick={() =>
                                                            updateTransaction(
                                                                transaction.id
                                                            )
                                                        }
                                                    >
                                                        {saving
                                                            ? "Saving..."
                                                            : "💾 Save Changes"}
                                                    </button>


                                                    <button
                                                        type="button"
                                                        className="cancel-btn"
                                                        disabled={
                                                            saving
                                                        }
                                                        onClick={
                                                            cancelEdit
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </div>
                                        )}

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Transactions;