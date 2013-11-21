package space.ai;

import space.ai.component.Component;
import space.ai.component.Logger;
import space.ai.component.control.For;
import space.ai.component.input.TextBuffer;
import space.ai.component.operation.Modulo;
import space.ai.component.operation.Xor;

public class AITest {
  public static void main(String[] args) {
    TextBuffer t = new TextBuffer();
    TextBuffer k = new TextBuffer();
    TextBuffer o = new TextBuffer();
    
    For f = new For();
    Modulo m = new Modulo();
    Xor<Character> x = new Xor<>();
    
    Logger l = new Logger();
    
    t.text = new Component.Value<String>() {
      @Override
      public String value() {
        return "This is a test";
      }
    };
    
    k.text = new Component.Value<String>() {
      @Override
      public String value() {
        return "seeecret";
      }
    };
    
    f.start = new Component.Value<Integer>() {
      @Override public Integer value() { return 0; }
    };
    
    f.stop = t.length;
    m.dividend = f.counter;
    m.divisor = k.length;
    t.index = f.counter;
    k.index = m.result;
    o.index = f.counter;
    x.a = t.charAt;
    x.b = k.charAt;
    l.in = x.result;
    
    o.input = x.result;
    
    //f.execution.add(l.log);
    f.execution.add(o.read);
    
    System.out.println(t.text.value());
    System.out.println("Encrypting");
    
    f.loop.execute();
    
    x.a = o.charAt;
    
    System.out.println(o.text.value());
    System.out.println("Reversing");
    
    t.text.clear();
    t.input = x.result;
    o.read.remove();
    f.execution.add(t.read);
    
    f.loop.execute();
    
    System.out.println(t.text.value());
  }
}