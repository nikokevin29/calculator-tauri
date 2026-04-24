/// Evaluate a simple math expression
/// Supports: + - * / and parentheses
/// Returns f64 result or error string
#[tauri::command]
pub fn calculate(expr: String) -> Result<f64, String> {
    let tokens = tokenize(&expr)?;
    let result = parse_expr(&tokens, &mut 0)?;
    if result.is_nan() || result.is_infinite() {
        return Err("Cannot divide by zero".to_string());
    }
    Ok(result)
}

#[tauri::command]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// ─── Tokenizer ──────────────────────────────────────────

#[derive(Debug, Clone, PartialEq)]
enum Token {
    Number(f64),
    Plus,
    Minus,
    Multiply,
    Divide,
    LParen,
    RParen,
}

fn tokenize(input: &str) -> Result<Vec<Token>, String> {
    let mut tokens = Vec::new();
    let mut chars = input.chars().peekable();

    while let Some(&ch) = chars.peek() {
        match ch {
            ' ' => { chars.next(); }
            '0'..='9' | '.' => {
                let mut num_str = String::new();
                while let Some(&c) = chars.peek() {
                    if c.is_ascii_digit() || c == '.' {
                        num_str.push(c);
                        chars.next();
                    } else {
                        break;
                    }
                }
                let n = num_str.parse::<f64>()
                    .map_err(|_| format!("Invalid number: {}", num_str))?;
                tokens.push(Token::Number(n));
            }
            '+' => { tokens.push(Token::Plus);     chars.next(); }
            '-' => { tokens.push(Token::Minus);    chars.next(); }
            '*' => { tokens.push(Token::Multiply); chars.next(); }
            '/' => { tokens.push(Token::Divide);   chars.next(); }
            '(' => { tokens.push(Token::LParen);   chars.next(); }
            ')' => { tokens.push(Token::RParen);   chars.next(); }
            _ => return Err(format!("Unknown character: {}", ch)),
        }
    }
    Ok(tokens)
}

// ─── Recursive Descent Parser ───────────────────────────
// Grammar:
//   expr   = term (('+' | '-') term)*
//   term   = factor (('*' | '/') factor)*
//   factor = NUMBER | '(' expr ')' | '-' factor

fn parse_expr(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    let mut left = parse_term(tokens, pos)?;

    while *pos < tokens.len() {
        match &tokens[*pos] {
            Token::Plus  => { *pos += 1; left += parse_term(tokens, pos)?; }
            Token::Minus => { *pos += 1; left -= parse_term(tokens, pos)?; }
            _ => break,
        }
    }
    Ok(left)
}

fn parse_term(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    let mut left = parse_factor(tokens, pos)?;

    while *pos < tokens.len() {
        match &tokens[*pos] {
            Token::Multiply => { *pos += 1; left *= parse_factor(tokens, pos)?; }
            Token::Divide   => {
                *pos += 1;
                let right = parse_factor(tokens, pos)?;
                if right == 0.0 {
                    return Err("Division by zero".to_string());
                }
                left /= right;
            }
            _ => break,
        }
    }
    Ok(left)
}

fn parse_factor(tokens: &[Token], pos: &mut usize) -> Result<f64, String> {
    if *pos >= tokens.len() {
        return Err("Unexpected end of expression".to_string());
    }

    match &tokens[*pos].clone() {
        Token::Number(n) => {
            *pos += 1;
            Ok(*n)
        }
        Token::Minus => {
            *pos += 1;
            Ok(-parse_factor(tokens, pos)?)
        }
        Token::LParen => {
            *pos += 1;
            let val = parse_expr(tokens, pos)?;
            if *pos >= tokens.len() || tokens[*pos] != Token::RParen {
                return Err("Missing closing parenthesis".to_string());
            }
            *pos += 1;
            Ok(val)
        }
        _ => Err(format!("Unexpected token: {:?}", tokens[*pos])),
    }
}

// ─── Tests ──────────────────────────────────────────────
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_ops() {
        assert_eq!(calculate("2 + 3".to_string()).unwrap(), 5.0);
        assert_eq!(calculate("10 - 4".to_string()).unwrap(), 6.0);
        assert_eq!(calculate("3 * 4".to_string()).unwrap(), 12.0);
        assert_eq!(calculate("15 / 3".to_string()).unwrap(), 5.0);
    }

    #[test]
    fn test_precedence() {
        assert_eq!(calculate("2 + 3 * 4".to_string()).unwrap(), 14.0);
        assert_eq!(calculate("(2 + 3) * 4".to_string()).unwrap(), 20.0);
    }

    #[test]
    fn test_div_zero() {
        assert!(calculate("5 / 0".to_string()).is_err());
    }
}
