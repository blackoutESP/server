import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginService } from '../../services/login.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  title = 'Login';
  loginForm: FormGroup;
  email = new FormControl('', [Validators.required, Validators.email]);
  user = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required]);
  error: boolean;
  errorMessage: string;
  constructor(private formBuilder: FormBuilder,
             private loginService: LoginService,
             private router: Router) {
    this.loginForm = new FormGroup({
        email: this.email,
        user: this.user,
        password: this.password
    });
    this.error = false;
  }

  ngOnInit() {

  }

  onSubmit() {
    this.loginService.login(this.loginForm.value.email, this.loginForm.value.user, this.loginForm.value.password).subscribe(data => {
            if(data['ok']){
              localStorage.setItem('token', data['token']);
              this.router.navigate(['file-server']);
            }else{
                this.error = true;
                this.errorMessage = data['fails'][0].msg;
                this.loginForm.reset();
            }
    });
  }

  register() {
    this.router.navigate(['register']);
  }

}
