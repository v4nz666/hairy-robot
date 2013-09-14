package main;

public abstract class Entity {
  public final int id;
  public double x, y;
  public double vx, vy;
  public double acc, angle;
  public double maxVel;
  public int size;
  
  public Entity(int id, double x, double y, int size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
  }
  
  public void update(double deltaT) {
    if(acc != 0) {
      double theta = Math.toRadians(angle);
      
      //TODO: work delta into here
      vx += Math.cos(theta) * acc;
      vy += Math.sin(theta) * acc;
      
      if(vx > maxVel) {
        vy *= (maxVel / vx);
        vx = maxVel;
        acc = 0;
      }
      
      if(vx < -maxVel) {
        vy *= (-maxVel / vx);
        vx = -maxVel;
        acc = 0;
      }
      
      if(vy > maxVel) {
        vx *= (maxVel / vy);
        vy = maxVel;
        acc = 0;
      }
      
      if(vy < -maxVel) {
        vx *= (-maxVel / vy);
        vy = -maxVel;
        acc = 0;
      }
    }
    
    displace();
  }
  
  private void displace() {
    x += vx;
    y += vy;
  }
}