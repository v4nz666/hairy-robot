package main;

public abstract class Entity {
  public final int id;
  public double x, y;
  public double vx, vy;
  public double acc, angle;
  public double maxVel;
  public int size;
  public int spawnID;
  
  public Entity(int id, double x, double y, int size) {
    this(id, x, y, size, id);
  }
  
  public Entity(int id, double x, double y, int size, int spawnID) {
    this.id = id;
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
}