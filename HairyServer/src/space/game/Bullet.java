package space.game;

import main.Entity;
import main.Server;
import main.User;

public class Bullet extends Entity {
  private static int _id;
  public static int nextID() { return _id++; }
  
  private User _user;
  public final int damage;
  
  private Add _add = new Add();
  private Rem _rem = new Rem();
  
  public User user() { return _user; }
  public Add serializeForAdd() { return _add; }
  public Rem serializeForRem() { return _rem; }
  
  public Bullet(User user, space.data.guns.Bullet bullet, float offsetAngle) {
    this(user, bullet, offsetAngle, 0);
  }
  
  public Bullet(User user, space.data.guns.Bullet bullet, float offsetAngle, float offsetSpacing) {
    super(nextID(), user.x, user.y, bullet.getSize(), user.id);
    
    _user = user;
    angle = user.angle;
    damage = bullet.getDamage();
    
    if(bullet instanceof space.data.guns.Bullet.Ballistic) {
      double a = Math.toRadians(user.angle);
      double a2 = Math.toRadians(offsetAngle);
      double a3 = Math.toRadians(offsetSpacing);
      x += Math.cos(a + a3) * user.size / 2;
      y += Math.sin(a + a3) * user.size / 2;
      
      space.data.guns.Bullet.Ballistic b = (space.data.guns.Bullet.Ballistic)bullet;
      vx = minOrMax(Math.cos(a + a2) * b.getVel(), user.vx);
      vy = minOrMax(Math.sin(a + a2) * b.getVel(), user.vy);
      acc = b.getAcc();
      maxVel = b.getMaxVel();
    }
  }
  
  private double minOrMax(double a, double b) {
    if(a == 0) return b; else
    if(a  < 0) return Math.min(a, b);
               return Math.max(a, b);
  }
  
  @Override
  public void update(double deltaT) {
    super.update(deltaT);
    
    if(x < -size || x > Server.W + size ||
       y < -size || y > Server.H + size) {
      remove();
    }
  }
  
  public void remove() {
    Server.instance().removeBullet(this);
  }
  
  public class Add {
    public int getId() { return id; }
    public double getX() { return x; }
    public double getY() { return y; }
    public int getSize() { return size; }
    public double getAngle() { return angle; }
    public double getVx() { return vx; }
    public double getVy() { return vy; }
    public double getAcc() { return acc; }
    public double getMaxVel() { return maxVel; }
  }
  
  public class Rem {
    public int getId() { return id; }
  }
}