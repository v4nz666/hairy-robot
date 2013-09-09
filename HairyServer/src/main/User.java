package main;

import java.util.Date;
import java.util.LinkedList;

import com.corundumstudio.socketio.SocketIOClient;

public class User {
  public final int id;
  public final SocketIOClient socket;
  
  private final LinkedList<Cmd> _cmd = new LinkedList<>();
  
  private String _name;
  private int _x, _y;
  private int _vx, _vy;
  private int _acc, _rot;
  private int _velMax;
  private int _size;
  private int _guns;
  private int _life;
  private int _shields;
  private int _kills;
  private int _deaths;
  private int _bullets;
  private long _lastReported = new Date().getTime();
  
  public User(int id, SocketIOClient socket, String name, int x, int y, int life, int shields) {
    this.id = id;
    this.socket = socket;
    
    _name = name;
    _x = x;
    _y = y;
    _life = life;
    _shields = shields;
  }
  
  public void addCommand(Cmd cmd) {
    _cmd.add(cmd);
  }
  
  public static class Cmd {
    private String _src;
    private String _commands;
    
    public Cmd() { }
    public Cmd(String src, String commands) {
      _src = src;
      _commands = commands;
    }
    
    public String getSrc()      { return _src; }
    public String getCommands() { return _commands; }
    public void setSrc     (String src)      { _src = src; }
    public void setCommands(String commands) { _commands = commands; }
  }
  
  public static class Params {
    private String _id;
    private String _color;
    
    public Params() { }
    public Params(String id, String color) {
      _id = id;
      _color = color;
    }
    
    public String getId()    { return _id; }
    public String getColor() { return _color; }
    public void setId   (String id)    { _id = id; }
    public void setColor(String color) { _color = color; }
  }
}