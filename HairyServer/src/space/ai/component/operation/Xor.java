package space.ai.component.operation;

import space.ai.component.Component;

public class Xor<T> extends Component {
  public Component.Value<T> a, b;
  public Component.Value<T> result = new Component.Value<T>() {
    @Override public T value() {
      try {
        Number n1 = (Number)a.value();
        Number n2 = (Number)b.value();
        return (T)(Number)(n1.intValue() ^ n2.intValue());
      } catch(ClassCastException ex) {
        Character n1 = (Character)a.value();
        Character n2 = (Character)b.value();
        return (T)(Character)(char)(n1 ^ n2);
      }
    }
  };
}