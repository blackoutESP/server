import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '../../services/signup.service';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  title = 'Register';
  loginForm: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email]);
  user = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  success: boolean;
  message: string;
  error: boolean;
  errorMessage: string;
  constructor(private router: Router, private signupService: SignupService) {
    this.loginForm = new FormGroup({
      email: this.email,
      user: this.user,
      password: this.password
    });
    this.error = false;
   }

  ngOnInit(): void {
  }

  onSubmit() {
    this.signupService.signup(this.loginForm.value.email, this.loginForm.value.user, this.loginForm.value.password).subscribe(data => {
      if (data['ok']) {
        this.success = true;
        this.message = 'Successfully registered.';
        setTimeout(() => this.message = null, 1000);
      }else{
        this.error = true;
        this.errorMessage = data['msg'];
        this.loginForm.reset();
        setTimeout(() => this.errorMessage = null, 1000);
      }
    });
  }

  back() {
    this.router.navigate(['']);
  }

}
