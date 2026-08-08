import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Categories.css";

function Categories() {
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        type: "EXPENSE",
    });

    const [editingId, setEditingId] = useState(null);

    const [editData, setEditData] = useState({
        name: "",
        type: "EXPENSE",
    });

    // ============================================================
    // LOAD CATEGORIES
    // ============================================================

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get("finance/categories/");
            setCategories(response.data);
        } catch (error) {
            console.error(
                "Error fetching categories:",
                error.response?.data || error.message
            );
        }
    };

    // ============================================================
    // FORM CHANGE
    // ============================================================

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // ============================================================
    // ADD CATEGORY
    // ============================================================

    const addCategory = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert("Please enter a category name.");
            return;
        }

        try {
            await api.post("finance/categories/", formData);

            alert("Category added successfully.");

            setFormData({
                name: "",
                type: "EXPENSE",
            });

            fetchCategories();
        } catch (error) {
            console.error(
                "Error adding category:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.name?.[0] ||
                error.response?.data?.error ||
                "Failed to add category."
            );
        }
    };

    // ============================================================
    // DELETE
    // ============================================================

    const deleteCategory = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`finance/categories/${id}/`);

            alert("Category deleted successfully.");

            fetchCategories();
        } catch (error) {
            console.error(
                "Error deleting category:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.error ||
                "Failed to delete category."
            );
        }
    };

    // ============================================================
    // START EDIT
    // ============================================================

    const startEdit = (category) => {
        setEditingId(category.id);

        setEditData({
            name: category.name,
            type: category.type,
        });
    };

    // ============================================================
    // EDIT CHANGE
    // ============================================================

    const handleEditChange = (e) => {
        setEditData({
            ...editData,
            [e.target.name]: e.target.value,
        });
    };

    // ============================================================
    // UPDATE
    // ============================================================

    const updateCategory = async (id) => {
        if (!editData.name.trim()) {
            alert("Category name cannot be empty.");
            return;
        }

        try {
            await api.put(
                `finance/categories/${id}/`,
                editData
            );

            alert("Category updated successfully.");

            setEditingId(null);

            fetchCategories();
        } catch (error) {
            console.error(
                "Error updating category:",
                error.response?.data || error.message
            );

            alert(
                error.response?.data?.name?.[0] ||
                error.response?.data?.error ||
                "Failed to update category."
            );
        }
    };

    // ============================================================
    // CATEGORY FILTER
    // ============================================================

    const incomeCategories = categories.filter(
        (category) => category.type === "INCOME"
    );

    const expenseCategories = categories.filter(
        (category) => category.type === "EXPENSE"
    );

    // ============================================================
    // CATEGORY ICON
    // ============================================================

    const getCategoryIcon = (name) => {
        if (!name) return "🏷️";

        const category = name.toLowerCase();

        if (
            category.includes("food") ||
            category.includes("restaurant") ||
            category.includes("meal")
        ) {
            return "🍔";
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
            category.includes("rent") ||
            category.includes("house") ||
            category.includes("home")
        ) {
            return "🏠";
        }

        if (
            category.includes("electric") ||
            category.includes("utility") ||
            category.includes("power")
        ) {
            return "💡";
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
            category.includes("salary") ||
            category.includes("income")
        ) {
            return "💰";
        }

        if (
            category.includes("entertainment") ||
            category.includes("movie")
        ) {
            return "🎬";
        }

        return "🏷️";
    };

    // ============================================================
    // CATEGORY CARD
    // ============================================================

    const renderCategory = (category) => {
        const isEditing = editingId === category.id;

        return (
            <div
                className={`category-card ${
                    isEditing ? "editing" : ""
                }`}
                key={category.id}
            >
                {isEditing ? (
                    <div className="category-edit-form">

                        <div className="edit-input-group">
                            <label>Category Name</label>

                            <input
                                type="text"
                                name="name"
                                value={editData.name}
                                onChange={handleEditChange}
                            />
                        </div>

                        <div className="edit-input-group">
                            <label>Type</label>

                            <select
                                name="type"
                                value={editData.type}
                                onChange={handleEditChange}
                            >
                                <option value="EXPENSE">
                                    Expense
                                </option>

                                <option value="INCOME">
                                    Income
                                </option>
                            </select>
                        </div>

                        <div className="category-actions">
                            <button
                                type="button"
                                className="save-btn"
                                onClick={() =>
                                    updateCategory(category.id)
                                }
                            >
                                ✓ Save
                            </button>

                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() =>
                                    setEditingId(null)
                                }
                            >
                                ✕ Cancel
                            </button>
                        </div>

                    </div>
                ) : (
                    <>
                        <div className="category-main">

                            <div className="category-icon">
                                {getCategoryIcon(category.name)}
                            </div>

                            <div className="category-info">

                                <h3>
                                    {category.name}
                                </h3>

                                <span
                                    className={`category-type ${
                                        category.type.toLowerCase()
                                    }`}
                                >
                                    {category.type === "INCOME"
                                        ? "Income"
                                        : "Expense"}
                                </span>

                            </div>

                        </div>

                        <div className="category-actions">

                            <button
                                type="button"
                                className="edit-btn"
                                onClick={() =>
                                    startEdit(category)
                                }
                            >
                                ✏️ Edit
                            </button>

                            <button
                                type="button"
                                className="delete-btn"
                                onClick={() =>
                                    deleteCategory(category.id)
                                }
                            >
                                🗑️ Delete
                            </button>

                        </div>
                    </>
                )}
            </div>
        );
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="categories-page">

            {/* HEADER */}

            <div className="categories-header">

                <div>
                    <div className="categories-welcome">
                        🏷️ Financial Organization
                    </div>

                    <h1>
                        Categories
                    </h1>

                    <p>
                        Organize your income and expenses
                        into meaningful categories.
                    </p>
                </div>

                <div className="category-count">
                    <strong>
                        {categories.length}
                    </strong>

                    <span>
                        Total Categories
                    </span>
                </div>

            </div>

            {/* ADD CATEGORY */}

            <div className="category-panel add-category-panel">

                <div className="panel-heading">

                    <div className="heading-icon">
                        ➕
                    </div>

                    <div>
                        <h2>
                            Add New Category
                        </h2>

                        <p>
                            Create a category for your
                            financial transactions.
                        </p>
                    </div>

                </div>

                <form
                    className="category-form"
                    onSubmit={addCategory}
                >

                    <div className="form-group">

                        <label htmlFor="category-name">
                            Category Name
                        </label>

                        <input
                            id="category-name"
                            type="text"
                            name="name"
                            placeholder="e.g. Food, Salary, Transport"
                            value={formData.name}
                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label htmlFor="category-type">
                            Category Type
                        </label>

                        <select
                            id="category-type"
                            name="type"
                            value={formData.type}
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

                    <button
                        className="add-category-btn"
                        type="submit"
                    >
                        <span>＋</span>
                        Add Category
                    </button>

                </form>

            </div>

            {/* CATEGORY SECTIONS */}

            <div className="category-sections">

                {/* EXPENSE */}

                <section className="category-panel">

                    <div className="section-header">

                        <div className="section-title">

                            <div className="section-icon expense">
                                💸
                            </div>

                            <div>
                                <h2>
                                    Expense Categories
                                </h2>

                                <p>
                                    Categories used to track
                                    your spending.
                                </p>
                            </div>

                        </div>

                        <span className="section-count expense-count">
                            {expenseCategories.length}
                        </span>

                    </div>

                    {expenseCategories.length === 0 ? (
                        <div className="empty-category">
                            <div>📭</div>

                            <h3>
                                No expense categories
                            </h3>

                            <p>
                                Add your first expense category
                                above.
                            </p>
                        </div>
                    ) : (
                        <div className="category-grid">
                            {expenseCategories.map(
                                renderCategory
                            )}
                        </div>
                    )}

                </section>

                {/* INCOME */}

                <section className="category-panel">

                    <div className="section-header">

                        <div className="section-title">

                            <div className="section-icon income">
                                💰
                            </div>

                            <div>
                                <h2>
                                    Income Categories
                                </h2>

                                <p>
                                    Categories used to track
                                    money you receive.
                                </p>
                            </div>

                        </div>

                        <span className="section-count income-count">
                            {incomeCategories.length}
                        </span>

                    </div>

                    {incomeCategories.length === 0 ? (
                        <div className="empty-category">
                            <div>📭</div>

                            <h3>
                                No income categories
                            </h3>

                            <p>
                                Add your first income category
                                above.
                            </p>
                        </div>
                    ) : (
                        <div className="category-grid">
                            {incomeCategories.map(
                                renderCategory
                            )}
                        </div>
                    )}

                </section>

            </div>

        </div>
    );
}

export default Categories;