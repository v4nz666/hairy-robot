package main;

import java.util.Random;

public class Planet extends Entity {
  private static Random _rand = new Random();
  
  private int _mass;
  private int _radius;
  private int _distance;
  
  private static int generateSize(int d) {
    System.out.println("Generating Planet at distance [" + d + "]");
    
    //TODO: Generate random number first, decide if it's going to be especially large or small
    
    return (int)((d / 1000) + (d / 3000 * _rand.nextFloat() - d/6000) );
  }
  
  public Planet(Star_System _system, int d) {
    this(-1, d, _system.getSize() / 2 , generateSize(d));
  }
  
  public Planet(int id, double x, double y, int size) {
    super(id, x, y, size);
    this._radius = size / 2;
    System.out.println("Planet generated with size [" + size + "]x, y[" + x + "," + y + "]");
  }

  
}
