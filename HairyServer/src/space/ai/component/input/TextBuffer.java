package space.ai.component.input;

import space.ai.component.Component;

public class TextBuffer {
  public Component.Value<String> text = new Component.Value<String>() {
    @Override public String value() { return _text; }
    @Override public void clear() { _text = ""; }
  };
  
  public Component.Value<Integer> index;
  
  public Component.Value<Integer> length = new Component.Value<Integer>() {
    @Override public Integer value() { return text.value().length(); }
  };
  
  public Component.Value<Character> charAt = new Component.Value<Character>() {
    @Override public Character value() { return text.value().charAt(index.value()); }
  };
  
  public Component.Value<Character> input;
  
  private String _text = "";
  
  public Component.Execution read = new Component.Execution() {
    @Override
    public void execute() {
      _text = _text.concat(input.value().toString());
    }
  };
}