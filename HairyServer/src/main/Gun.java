package main;

import space.data.guns.Bullet;

public class Gun {
  private static Server _server = Server.instance();
  
  public final space.data.guns.Gun gun;
  public final space.data.guns.Bullet bullet;
  
  protected long _lastBullet;
  protected long _bulletsLeft;
  protected int _barrel;
  protected float _barrelAngle;
  
  public Gun(space.data.guns.Gun gun, space.data.guns.Bullet bullet) {
    this.gun = gun;
    this.bullet = bullet;
    
    _barrelAngle = -gun.getBarrelSpread() * (gun.getBarrels() - 1) / 2;
  }
  
  public void fire(User user) {
    Bullet.Ammo      ammo      = bullet instanceof Bullet.Ammo      ? (Bullet.Ammo)     bullet : null;
    Bullet.Ballistic ballistic = bullet instanceof Bullet.Ballistic ? (Bullet.Ballistic)bullet : null;
    //Bullet.Energy    energy    = bullet instanceof Bullet.Energy    ? (Bullet.Energy)   bullet : null;
    
    if(ballistic != null) {
      if(_lastBullet <= System.nanoTime()) {
        _server.addBullet(new space.game.Bullet(user, bullet, gun.getBulletDeviation(), _barrelAngle)); //TODO: Factor in some random with getBulletDeviation()
        
        _barrel++;
        if(_barrel >= gun.getBarrels()) {
          _barrel = 0;
          _barrelAngle = -gun.getBarrelSpread() * (gun.getBarrels() - 1) / 2;
        } else {
          _barrelAngle += gun.getBarrelSpread();
        }
        
        if(ammo != null) {
          if(_bulletsLeft == 0) {
            _bulletsLeft = ammo.getClipSize();
          }
          
          _bulletsLeft--;
          if(_bulletsLeft > 0) {
            _lastBullet = System.nanoTime() + ballistic.getROF();
          } else {
            _lastBullet = System.nanoTime() + ammo.getReloadTime();
          }
        } else {
          _lastBullet = System.nanoTime() + ballistic.getROF();
        }
      }
    }
  }
}