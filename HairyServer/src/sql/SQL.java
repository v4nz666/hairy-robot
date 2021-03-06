package sql;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;

public abstract class SQL {
  private static SQL _instance;
  public static SQL getInstance() { return _instance; }
  public static SQL create(Class<? extends SQL> sql) throws InstantiationException, IllegalAccessException {
    _instance = sql.newInstance();
    return _instance;
  }
  
  private Connection _connection;
  private ArrayList<PreparedStatement> _statement = new ArrayList<>();
  
  protected abstract Connection create(String url, String db, String name, String pass) throws SQLException, ClassNotFoundException;
  public void connect(String url, String db, String name, String pass) throws ClassNotFoundException, SQLException  {
    _connection = create(url, db, name, pass);
  }
  
  public void close() {
    try {
      for(PreparedStatement statement : _statement) {
        statement.close();
      }
      
      _statement.clear();
      
      if(_connection != null) _connection.close();
    } catch(SQLException e) {
      e.printStackTrace();
    }
  }
  
  public boolean tableExists(String name) {
    try {
      DatabaseMetaData dbm = _connection.getMetaData();
      return dbm.getTables(null, null, name, null).next();
    } catch(SQLException e) {
      e.printStackTrace();
    }
    
    return false;
  }
  
  public PreparedStatement prepareStatement(String sql) {
    return prepareStatement(sql, 0);
  }
  
  public PreparedStatement prepareStatement(String sql, int autoGeneratedKeys) {
    try {
      PreparedStatement statement = _connection.prepareStatement(sql, autoGeneratedKeys);
      _statement.add(statement);
      return statement;
    } catch(SQLException e) {
      e.printStackTrace();
    }
    
    return null;
  }
}