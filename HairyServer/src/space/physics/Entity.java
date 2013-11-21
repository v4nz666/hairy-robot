package space.physics;

public abstract class Entity {
  
  public final int id;
  public final String name;
  public double x, y;
  public double vx, vy;
  public double acc, angle;
  public double maxVel;
  public int size;
  public int spawnID;
  
  protected Add    _add    = new Add();
  protected Update _update = new Update();
  
  public Add    serializeAdd()    { return _add; }
  public Update serializeUpdate() { return _update; }
  
  public Entity(int id, String name, double x, double y, int size) {
    this(id, name, x, y, size, id);
  }
  
  public Entity(int id, String name, double x, double y, int size, int spawnID) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.size = size;
    this.spawnID = spawnID;
  }
  
  public void update(double deltaT) {
    if(acc != 0) {
      double theta = Math.toRadians(angle);
      
      //TODO: work delta into here
      vx += Math.cos(theta) * acc;
      vy += Math.sin(theta) * acc;
      
      clampVels();
    }
    
    displace();
  }
  
  public void clampVels() {
    if(vx > maxVel) {
      vy *= (maxVel / vx);
      vx = maxVel;
    }
    
    if(vx < -maxVel) {
      vy *= (-maxVel / vx);
      vx = -maxVel;
    }
    
    if(vy > maxVel) {
      vx *= (maxVel / vy);
      vy = maxVel;
    }
    
    if(vy < -maxVel) {
      vx *= (-maxVel / vy);
      vy = -maxVel;
    }
  }
  
  public void displace() {
    x += vx;
    y += vy;
  }
  
  public void stop() {
    vx = vy = acc = 0;
  }
  
  public boolean isNear(Entity e) {
    return Math.sqrt(Math.pow(x - e.x, 2) + Math.pow(y - e.y, 2)) - e.size <= 2000;
  }
  
  public class Add {
    public int getI() { return id; }
    public String getN() { return name; }
  }
  
  public class Update {
    public int getI() { return id; }
    public int getX() { return (int)x; }
    public int getY() { return (int)y; }
    public double getA() { return angle; }
  }
  
  public static class Request {
    public int[] i;
  }
}