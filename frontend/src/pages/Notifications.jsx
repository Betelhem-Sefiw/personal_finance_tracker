import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Notifications.css";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // ============================================================
    // GET NOTIFICATIONS
    // ============================================================

    const fetchNotifications = async () => {
        try {
            const response = await api.get(
                "finance/notifications/"
            );

            setNotifications(response.data);

        } catch (error) {
            console.error(
                "Error fetching notifications:",
                error.response?.data || error.message
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // LOAD NOTIFICATIONS
    // ============================================================

    useEffect(() => {
        fetchNotifications();
    }, []);

    // ============================================================
    // MARK AS READ
    // ============================================================

    const markAsRead = async (notification) => {
        try {
            await api.put(
                `finance/notifications/${notification.id}/`,
                {
                    is_read: true,
                }
            );

            setNotifications((previous) =>
                previous.map((item) =>
                    item.id === notification.id
                        ? { ...item, is_read: true }
                        : item
                )
            );

        } catch (error) {
            console.error(
                "Error marking notification as read:",
                error.response?.data || error.message
            );
        }
    };

    // ============================================================
    // DELETE
    // ============================================================

    const deleteNotification = async (id) => {
        try {
            await api.delete(
                `finance/notifications/${id}/`
            );

            setNotifications((previous) =>
                previous.filter(
                    (notification) =>
                        notification.id !== id
                )
            );

        } catch (error) {
            console.error(
                "Error deleting notification:",
                error.response?.data || error.message
            );
        }
    };

    // ============================================================
    // NOTIFICATION ICON
    // ============================================================

    const getNotificationIcon = (type) => {
        switch (type) {
            case "BUDGET":
                return "💰";

            case "BALANCE":
                return "⚠️";

            case "TRANSACTION":
                return "💳";

            default:
                return "🔔";
        }
    };

    // ============================================================
    // NOTIFICATION TITLE
    // ============================================================

    const getNotificationTitle = (type) => {
        switch (type) {
            case "BUDGET":
                return "Budget Alert";

            case "BALANCE":
                return "Balance Alert";

            case "TRANSACTION":
                return "Transaction";

            default:
                return "Notification";
        }
    };

    // ============================================================
    // STATISTICS
    // ============================================================

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    const readCount = notifications.filter(
        (notification) => notification.is_read
    ).length;

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {
        return (
            <div className="notifications-container">

                <div className="notifications-loading">
                    <div className="loading-icon">
                        🔔
                    </div>

                    <h2>Loading notifications...</h2>

                    <p>
                        Please wait while we get your latest alerts.
                    </p>
                </div>

            </div>
        );
    }

    // ============================================================
    // UI
    // ============================================================

    return (
        <div className="notifications-container">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="notifications-header">

                <div>

                    <div className="notifications-title">

                        <span className="title-icon">
                            🔔
                        </span>

                        <div>
                            <h1>Notifications</h1>

                            <p>
                                Stay updated with your financial activity.
                            </p>
                        </div>

                    </div>

                </div>

                {unreadCount > 0 && (
                    <div className="unread-summary">
                        <span>
                            {unreadCount}
                        </span>

                        unread
                    </div>
                )}

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="notification-stats">

                <div className="notification-stat">

                    <div className="stat-icon">
                        🔔
                    </div>

                    <div>
                        <span>Total</span>
                        <strong>
                            {notifications.length}
                        </strong>
                    </div>

                </div>


                <div className="notification-stat">

                    <div className="stat-icon unread-icon">
                        🔴
                    </div>

                    <div>
                        <span>Unread</span>
                        <strong>
                            {unreadCount}
                        </strong>
                    </div>

                </div>


                <div className="notification-stat">

                    <div className="stat-icon read-icon">
                        ✅
                    </div>

                    <div>
                        <span>Read</span>
                        <strong>
                            {readCount}
                        </strong>
                    </div>

                </div>

            </div>


            {/* ==================================================
                EMPTY STATE
            ================================================== */}

            {notifications.length === 0 ? (

                <div className="empty-notifications">

                    <div className="empty-notification-icon">
                        🎉
                    </div>

                    <h2>You're all caught up!</h2>

                    <p>
                        You don't have any notifications right now.
                    </p>

                </div>

            ) : (

                /* ==================================================
                   NOTIFICATION LIST
                ================================================== */

                <div className="notifications-list">

                    {notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className={`notification-card ${
                                notification.is_read
                                    ? "read"
                                    : "unread"
                            }`}
                        >

                            {/* ICON */}

                            <div
                                className={`notification-icon ${
                                    notification.notification_type
                                        ?.toLowerCase()
                                }`}
                            >
                                {getNotificationIcon(
                                    notification.notification_type
                                )}
                            </div>


                            {/* CONTENT */}

                            <div className="notification-content">

                                <div className="notification-top">

                                    <div>

                                        <span className="notification-type">
                                            {getNotificationTitle(
                                                notification.notification_type
                                            )}
                                        </span>

                                        <h3>
                                            {notification.message}
                                        </h3>

                                    </div>

                                    {!notification.is_read && (
                                        <span className="new-badge">
                                            NEW
                                        </span>
                                    )}

                                </div>


                                <p className="notification-date">
                                    🕐{" "}
                                    {new Date(
                                        notification.created_at
                                    ).toLocaleString()}
                                </p>


                                {/* ACTIONS */}

                                <div className="notification-actions">

                                    {!notification.is_read && (

                                        <button
                                            className="read-button"
                                            onClick={() =>
                                                markAsRead(
                                                    notification
                                                )
                                            }
                                        >
                                            ✓ Mark as Read
                                        </button>

                                    )}

                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            deleteNotification(
                                                notification.id
                                            )
                                        }
                                    >
                                        🗑 Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Notifications;
