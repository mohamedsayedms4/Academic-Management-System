package org.example.academicmanagementsystem;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

public class CheckLeads {
    public static void main(String[] args) {
        String url = "jdbc:mysql://72.60.188.251:3306/academic_db";
        String user = "mohalhal";
        String pass = "MoN#150%17RR";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            ResultSet rs = stmt.executeQuery("SELECT count(*) FROM leads");
            if (rs.next()) {
                System.out.println("Total Leads in DB: " + rs.getInt(1));
            }
            
            rs = stmt.executeQuery("SELECT count(*) FROM users");
            if (rs.next()) {
                System.out.println("Total Users in DB: " + rs.getInt(1));
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
