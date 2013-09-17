package space.game;

import main.Entity;
import main.Server;
import main.User;

public class Bullet extends Entity {
  private User _user;
  public final int damage;
  
  public User user() {
    return _user;
  }
  
  public Bullet(User user, space.data.guns.Bullet bullet, float offsetAngle) {
    this(user, bullet, offsetAngle, 0);
  }
  
  public Bullet(User user, space.data.guns.Bullet bullet, float offsetAngle, float offsetSpacing) {
    super(user.id, user.x, user.y, bullet.getSize());
    
    _user = user;
    angle = user.angle;
    damage = bullet.getDamage();
    
    if(bullet instanceof space.data.guns.Bullet.Ballistic) {
      double a = Math.toRadians(user.angle);
      double a2 = Math.toRadians(offsetAngle);
      double a3 = Math.toRadians(offsetSpacing);
      System.out.println(x + "\t" + y);
      x += Math.cos(a + a3) * user.size / 2;
      y += Math.sin(a + a3) * user.size / 2;
      System.out.println(x + "\t" + y);
      
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
}