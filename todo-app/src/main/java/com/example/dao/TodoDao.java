package com.example.dao;

import com.example.model.Todo;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class TodoDao {
   
    private String jdbcURL = "jdbc:mysql://localhost:3306/todo_db?useSSL=false";
    private String jdbcUsername = "root";
    private String jdbcPassword = "1234";

    private static final String INSERT_TODO_SQL = "INSERT INTO tasks (title) VALUES (?);";
    private static final String SELECT_ALL_TODOS = "SELECT id, title, is_completed FROM tasks ORDER BY id;";
    private static final String DELETE_TODO_SQL = "DELETE FROM tasks WHERE id = ?;";
    private static final String UPDATE_TODO_SQL = "UPDATE tasks SET is_completed = ? WHERE id = ?;";

    protected Connection getConnection() throws SQLException {
        Connection connection = null;
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = DriverManager.getConnection(jdbcURL, jdbcUsername, jdbcPassword);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return connection;
    }

    // CREATE
    public void addTodo(Todo todo) throws SQLException {
        try (Connection connection = getConnection(); PreparedStatement ps = connection.prepareStatement(INSERT_TODO_SQL)) {
            ps.setString(1, todo.getTitle());
            ps.executeUpdate();
        }
    }

    // READ
    public List<Todo> getAllTodos() {
        List<Todo> todos = new ArrayList<>();
        try (Connection connection = getConnection(); PreparedStatement ps = connection.prepareStatement(SELECT_ALL_TODOS);) {
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                int id = rs.getInt("id");
                String title = rs.getString("title");
                boolean isCompleted = rs.getBoolean("is_completed");
                todos.add(new Todo(id, title, isCompleted));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return todos;
    }

    // UPDATE
    public boolean updateTodoStatus(int id, boolean isCompleted) throws SQLException {
        boolean rowUpdated;
        try (Connection connection = getConnection(); PreparedStatement ps = connection.prepareStatement(UPDATE_TODO_SQL);) {
            ps.setBoolean(1, isCompleted);
            ps.setInt(2, id);
            rowUpdated = ps.executeUpdate() > 0;
        }
        return rowUpdated;
    }

    // DELETE
    public boolean deleteTodo(int id) throws SQLException {
        boolean rowDeleted;
        try (Connection connection = getConnection(); PreparedStatement ps = connection.prepareStatement(DELETE_TODO_SQL);) {
            ps.setInt(1, id);
            rowDeleted = ps.executeUpdate() > 0;
        }
        return rowDeleted;
    }
}