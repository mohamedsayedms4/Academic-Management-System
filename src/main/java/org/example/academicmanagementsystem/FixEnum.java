import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixEnum {
    public static void main(String[] args) {
        String url = "jdbc:mysql://72.60.188.251:3306/academic_db";
        String user = "mohalhal";
        String pass = "MoN#150%17RR";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            String sql = "ALTER TABLE users MODIFY COLUMN role ENUM('ADMIN', 'MODERATOR', 'TELESALES', 'ACCOUNTANT', 'EMPLOYEE', 'FREELANCER') NOT NULL";
            stmt.executeUpdate(sql);
            System.out.println("Enum updated successfully.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
