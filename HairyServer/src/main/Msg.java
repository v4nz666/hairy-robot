package main;

public class Msg {
  private String _id;
  private String _msg;
  
  public Msg() { }
  public Msg(String id, String msg) {
    _id = id;
    _msg = msg;
  }
  
  public String getID()  { return _id; }
  public String getMsg() { return _msg; }
  public void setID (String id)  { _id  = id; }
  public void setMsg(String msg) { _msg = msg; }
}