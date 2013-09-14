package sql;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class MySQL extends SQL {
  protected MySQL() { }
  
  protected Connection create(String url, String db, String name, String pass) throws SQLException, ClassNotFoundException {
    Class.forName("com.mysql.jdbc.Driver");
    return DriverManager.getConnection("jdbc:mysql://" + url + "/" + db, name, pass);
  }
}