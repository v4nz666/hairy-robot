package main;

public class Bullet extends Entity {
  protected User _user;
  
  public final int damage;
  
  public Bullet(User user, double offset, int size, double vel, double maxVel, int damage) {
    super(user.id, user.x, user.y, size);
    _user = user;
    vx = minOrMax(Math.cos(Math.toRadians(user.angle + offset)) * vel, user.vx);
    vy = minOrMax(Math.sin(Math.toRadians(user.angle + offset)) * vel, user.vy);
    this.maxVel = maxVel;
    this.damage = damage;
  }
  
  private double minOrMax(double a, double b) {
    if(a == 0) return b; else
    if(a  < 0) return Math.min(a, b);
               return Math.max(a, b);
  }
  
  public static class Explosion {
    public final String size;
    public final int x, y;
    public final long tick;
    
    public Explosion(String size, int x, int y, long tick) {
      this.size = size;
      this.x = x;
      this.y = y;
      this.tick = tick;
    }
  }
}