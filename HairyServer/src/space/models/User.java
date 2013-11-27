package space.models;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import space.Server;
import space.physics.Entity;
import sql.SQL;

import com.corundumstudio.socketio.SocketIOClient;

public class User {
  private static SQL sql = SQL.getInstance();
  private static PreparedStatement select = sql.prepareStatement("SELECT `id`, `auth`, `credits` FROM `users` WHERE `username`=?");
  
  private static Server _server = Server.instance();
  
  public static User getUserIfAuthed(SocketIOClient socket, User.Login data) throws SQLException {
    select.setString(1, data.name);
    
    try(ResultSet r = select.executeQuery()) {
      if(r.next()) {
        if(data.auth.equals(r.getString("auth"))) {
          return new User(socket, r, data);
        } else {
          System.err.println("Auth error for " + data.name + " (" + socket.getRemoteAddress() + ")");
          //TODO: Log auth error
        }
      }
    }
    
    return null;
  }
  
  public final SocketIOClient socket;
  public final int id;
  public final String name;
  public final int credits;
  
  private LoginResponse _serializeLoginResponse = new LoginResponse();
  
  public LoginResponse serializeLoginResponse() { return _serializeLoginResponse; }
  
  private Ship _ship;
  
  private User(SocketIOClient socket, ResultSet r, User.Login data) throws SQLException {
    this.socket = socket;
    id = r.getInt("id");
    name = data.name;
    credits = r.getInt("credits");
  }
  
  public Ship ship() { return _ship; }
  
  public void sendMessage(String from, String message) {
    socket.sendEvent("ms", new User.Message(from, message));
  }
  
  public void sendEntity(Entity.Add add) {
    socket.sendEvent("ea", add);
  }
  
  public void sendCelestial(Entity.Add add) {
    socket.sendEvent("ca", add);
  }
  
  public void sendUpdate(Entity.Update[] update) {
    socket.sendEvent("up", update);
  }
  
  public void sendCelestials(Entity.Update[] update) {
    socket.sendEvent("cp", update);
  }
  
  public void useShip(Ship.Use data) {
    leaveShip();
    
    _ship = _server.findShip(data.s, data.i);
    
    //TODO: handle shit
    if(_ship == null) {
      System.out.println("Disconnecting user for invalid ship");
      socket.disconnect();
      return;
    }
    
    _ship.use(this);
  }
  
  public void leaveShip() {
    if(_ship != null) {
      _ship.leave();
    }
  }
  
  public void sendUseShip(Ship ship) {
    socket.sendEvent("us", new Ship.Use(ship));
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