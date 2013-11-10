package space;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import sql.SQL;

import com.corundumstudio.socketio.SocketIOClient;

public class User {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT `id`, `auth` FROM `users` WHERE `username`=?");
  
  public static User getUserIfAuthed(SocketIOClient socket, User.Login data) throws SQLException {
    select.setString(1, data.name);
    
    try(ResultSet r = select.executeQuery()) {
      if(r.next()) {
        if(data.auth.equals(r.getString("auth"))) {
          return new User(socket, r.getInt("id"), data);
        } else {
          //TODO: Log auth error
        }
      }
    }
    
    return null;
  }
  
  public final SocketIOClient socket;
  public final int id;
  public final String name;
  
  private LoginResponse _serializeLoginResponse = new LoginResponse();
  
  public LoginResponse serializeLoginResponse() { return _serializeLoginResponse; }
  
  private Ship _ship;
  
  private User(SocketIOClient socket, int id, User.Login data) throws SQLException {
    this.socket = socket;
    this.id = id;
    this.name = data.name;
  }
  
  public void useShip(int id) throws SQLException {
    _ship = Ship.load(id);
  }
  
  public Ship ship() {
    return _ship;
  }
  
  public static class Login {
    public String name;
    public String auth;
  }
  
  public class LoginResponse {
    public int getId() { return id; }
    
    public void send() {
      socket.sendEvent("lr", this);
    }
  }
  
  public static class Message {
    public String id;
    public String msg;
    
    public Message() { }
    public Message(String id, String msg) {
      this.id = id;
      this.msg = msg;
    }
  }
}