package main;

public abstract class Entity {
  public final int id;
  public double x, y;
  public double vx, vy;
  public double acc, angle;
  public double maxVel = 6;
  public int size;
  
  public Entity(int id, double x, double y, int size) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.size = size;
  }
  
  public void update(double deltaT) {
    double theta = Math.toRadians(angle);
    
    //TODO: work delta into here
    vx = constrain(vx + Math.cos(theta) * acc, -maxVel, maxVel);
    vy = constrain(vy + Math.sin(theta) * acc, -maxVel, maxVel);
    
    displace();
  }
  
  private void displace() {
    x += vx;
    y += vy;
    
    int xmin = size / 2;
    int ymin = size / 2;
    int xmax = Server.W - xmin; //TODO: No more fixed size
    int ymax = Server.H - ymin;
    
    if(x < xmin) { x = xmin; vx = 0; }
    if(x > xmax) { x = xmax; vx = 0; }
    if(y < ymin) { y = ymin; vy = 0; }
    if(y > ymax) { y = ymax; vy = 0; }
  }
  
  private double constrain(double val, double min, double max) {
    return Math.max(min, Math.min(val, max));
  }
}