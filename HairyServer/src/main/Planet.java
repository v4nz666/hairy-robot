package main;

import java.util.Random;

public class Planet extends Entity {
  private static Random _rand = new Random();
  
  private int _mass;
  private int _distance;
  
  private static int generateSize(int d) {
    System.out.println("Generating Planet at distance [" + d + "]");
    
    //TODO: Generate random number first, decide if it's going to be especially large or small
    return (int)((d / 1000) + (d / 3000 * _rand.nextFloat() - d/6000) );
  }
  
  public Planet(Star_System _system, int d) {
    this(-1, 0, 0, generateSize(d));

    // Select a random spot in the orbit to generate our planet at
    int theta = _rand.nextInt(360);
    int mid = _system.getSize() / 2;
    
    this.x = Math.floor(mid + (Math.cos(theta * Math.PI / 180) * d));
    this.y = Math.floor(mid - (Math.sin(theta * Math.PI / 180) * d));
    System.out.println("Planet: size [" + this.size + "] at[" + theta + "]degrees " + 
        "[" + (int)this.x + ", " + (int)this.y + "]");
  }
  
  public Planet(int id, double x, double y, int size) {
    super(id, x, y, size);
  }
}